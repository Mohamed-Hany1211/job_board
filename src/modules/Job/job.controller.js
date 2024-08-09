// files imports
import Job from '../../../DB/models/job.model.js';
import Company from '../../../DB/models/company.model.js';
import Application from '../../../DB/models/application.model.js';
import { joblocation } from '../../utils/job-location.js';
import { senioritylevel } from '../../utils/seniority-level.js';
import { workingtime } from '../../utils/working-time.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
import { APIFeatures } from '../../utils/api-features.js';

// ============================= add job ======================= //
/*
    // 1 - destructing the required data 
    // 2 - destructing id of company's HR 
    // 3 - check on the enum types
    // 4 - create the job document in DB
    // 5 - add the data of the new document to the request object for the rollback 
    // 6 - check if the job's document created
    // 7 - return the response
*/
export const addJob = async (req, res, next) => {
    // 1 - destructing the required data 
    const {
        jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills,
    } = req.body;
    // 2 - destructing id of company's HR 
    const { _id } = req.authUser;
    // 3 - check on the enum types
    if (jobLocation !== joblocation.ONSITE && jobLocation !== joblocation.REMOTELY && jobLocation !== joblocation.HYBRID) {
        return next(new Error(`job location should be onsite , remotely or hybrid`, { cause: 400 }));
    }

    if (seniorityLevel !== senioritylevel.CTO && seniorityLevel !== senioritylevel.JUNIOR && seniorityLevel !== senioritylevel.MID_LEVEL && seniorityLevel !== senioritylevel.SENIOR && seniorityLevel !== senioritylevel.TEAM_LEAD) {
        return next(new Error(`seniority level should be junior , mid-level , senior ,team-lead or cto`, { cause: 400 }));
    }

    if (workingTime !== workingtime.FULLTIME && workingTime !== workingtime.PARTTIME) {
        return next(new Error(`working time should be fulltime or partTime`, { cause: 400 }));
    }
    // 4 - create the job document in DB
    const newJob = await Job.create({
        jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills,
        addedBy: _id
    });
    // 5 - add the data of the new document to the request object for the rollback 
    req.savedDocument = { model: Job, _id: newJob._id };
    // 6 - check if the job's document created
    if (!newJob) {
        return next(new Error('job creation failed', { cause: 500 }));
    }
    // 7 - return the response
    return res.status(201).json({
        success: true,
        message: 'Job added successfully',
        data: newJob,
    });
}

// ============================ update job ====================== //
/*
    // 1 - destructing the required data
    // 2 - destructing the id of the job
    // 3 - destructing the id of the signedIn user 
    // 4 - find the job by id
    // 5 - check if the job exist
    // 6 - check on the enum variables
    // 7 - update the job document in DB
    // 8 - return the updated job document
*/
export const updateJob = async (req, res, next) => {
    // 1 - destructing the required data
    const {
        jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills,
    } = req.body;
    // 2 - destructing the id of the job
    const { jobId } = req.query;
    // 3 - destructing the id of the signedIn user 
    const { _id } = req.authUser;
    // 4 - find the job by id
    const jobToBeUpdated = await Job.findOne({
        _id: jobId,
        addedBy: _id
    });
    // 5 - check if the job exist
    if (!jobToBeUpdated) {
        return next(new Error('Job not found', { cause: 404 }));
    }
    // 6 - check on the enum variables
    if (jobLocation) {
        if (jobLocation !== joblocation.ONSITE && jobLocation !== joblocation.REMOTELY && jobLocation !== joblocation.HYBRID) {
            return next(new Error(`job location should be onsite , remotely or hybrid`, { cause: 400 }));
        }
    }
    if (seniorityLevel) {
        if (seniorityLevel !== senioritylevel.CTO && seniorityLevel !== senioritylevel.JUNIOR && seniorityLevel !== senioritylevel.MID_LEVEL && seniorityLevel !== senioritylevel.SENIOR && seniorityLevel !== senioritylevel.TEAM_LEAD) {
            return next(new Error(`seniority level should be junior , mid-level , senior ,team-lead or cto`, { cause: 400 }));
        }
    }
    if (workingTime) {
        if (workingTime !== workingtime.FULLTIME && workingTime !== workingtime.PARTTIME) {
            return next(new Error(`working time should be fulltime or partTime`, { cause: 400 }));
        }
    }
    // 7 - update the job document in DB
    jobToBeUpdated.jobTitle = jobTitle;
    jobToBeUpdated.jobLocation = jobLocation;
    jobToBeUpdated.workingTime = workingTime;
    jobToBeUpdated.seniorityLevel = seniorityLevel;
    jobToBeUpdated.jobDescription = jobDescription;
    jobToBeUpdated.technicalSkills = technicalSkills;
    jobToBeUpdated.softSkills = softSkills;
    await jobToBeUpdated.save();
    // 8 - return the updated job document
    return res.status(200).json({
        success: true,
        message: 'Job updated successfully',
        data: jobToBeUpdated,
    });
}

// ============================ delete job ====================== //
/*
    // 1 - destructuring the id of the job
    // 2 - destructuring the id of the signedIn user
    // 3 - find the required company
    // 4 - find the job by id
    // 5 - check if the job exist
    // 6 - delete all related applications to that job
    // 7 - delete the users CVs from the host
    // 8 - return the response
*/
export const deleteJob = async (req, res, next) => {
    // 1 - destructuring the id of the job
    const { jobId } = req.query;
    // 2 - destructuring the id of the signedIn user
    const { _id } = req.authUser;
    // 3 - find the required company
    const requirdCompany = await Company.findOne({companyHR:_id});
    // 4 - find the job by id
    const jobToBeDeleted = await Job.findOneAndDelete({
        _id: jobId,
        addedBy: _id
    });
    // 5 - check if the job exist
    if (!jobToBeDeleted) {
        return next(new Error('Job not found', { cause: 404 }));
    }
    // 6 - delete all related applications to that job
    await Application.deleteMany({ jobId });
    // 7 - delete the job with CVs from the host
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_MEDIA_FOLDER}/COMPANIES/${requirdCompany.companyHostFolderId}/JOBS/${jobToBeDeleted.jobTitle}`);
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_MEDIA_FOLDER}/COMPANIES/${requirdCompany.companyHostFolderId}/JOBS/${jobToBeDeleted.jobTitle}`);
    // 8 - return the response
    return res.status(200).json({
        success: true,
        message: 'Job deleted successfully',
    });
}

// =========================== Get all Jobs with their company’s information ========================== //
/*
    // 1 - destructing the required data
    // 2 - get all jobs with thier info
    // 3 - check if there is no jobs
    // 4 - return the response
*/
export const getAllJobsWithCompaniesInfo = async (req, res, next) => {
    // 1 - destructing the required data
    const {page,size} = req.query;
    // 2 - get all jobs with thier info
    const features = new APIFeatures(req.query,Job.find()).pagination({page,size});
    const allJobs = await features.mongooseQuery.populate([{
            path: 'Company'
        }]);
    // 3 - check if there is no jobs 
    if (!allJobs) {
        return next(new Error('No jobs found', { cause: 404 }));
    }
    // 4 - return the response
    return res.status(200).json({
        success: true,
        message: 'All jobs with companies info fetched successfully',
        data: allJobs
    });
}

// =========================== Get all Jobs for a specific company ====================== //
/*
    // 1 - destructing the company's name
    // 2 - find the required company
    // 3 - check if the company exist
    // 4 - return the response
*/
export const getAllJobsForSpecificCompany = async (req, res, next) => {
    // 1 - destructing the company's name
    const { companyName } = req.query;
    // 2 - find the required company
    const requiredCompany = await Company.findOne({ companyName }).populate([{
        path: 'Jobs'
    }]);
    // 3 - check if the company exist
    if (!requiredCompany) {
        return next(new Error('Company not found', { cause: 404 }));
    }
    // 4 - return the response
    return res.status(200).json({
        success: true,
        message: `All jobs for ${companyName} company fetched successfully`,
        data: requiredCompany
    });
}


// =========================== Get all Jobs that match the following filters  ====================== //
/*
    // 1 - destructing the required data
    // 2 - get the jobs with specified filter
    // 3 - check if there is no jobs
    // 4 - return the response
*/
export const getJobsWithFilter = async (req,res,next) =>{
    // 1 - destructing the required data
    const {...filters} = req.query;
    // 2 - get the jobs with specified filter
    const features = new APIFeatures(req.query,Job.find()).filter(filters);
    const allJobs = await features.mongooseQuery.populate([{
        path: 'Company'
    }]);
    // 3 - check if there is no jobs
    if (!allJobs) {
        return next(new Error('No jobs found', { cause: 404 }));
    }
    // 4 - return the response
    return res.status(200).json({
        success: true,
        message: 'All jobs that match the filters fetched successfully',
        data: allJobs
    });
}

// ================================= Apply to Job ============================ //
/*
    // 1 - destructing the job's id
    // 2 - finding the job
    // 3 - destructing the user's id
    // 4 - find the company that related to that HR
    // 5 - destructing the required skills
    // 6 - create userResume object
    // 7 - check if the user uploaded resume
        // 7.1 - store the folder for rollback
    // 8 - create the job application object 
    // 9 - create the job application document in DB
    // 10 - add the data of the new document to the request object for the rollback 
    // 11 - check if the job application created
    // 12 - return the response
*/
export const applyToJob = async (req, res, next) => {
    // 1 - destructing the job's id
    const { jobId ,companyName} = req.query;
    // 2 - finding the job
    const requiredJob = await Job.findById(jobId);
    if(!requiredJob){
        return next(new Error('Job not found', { cause: 404 }));
    }
    // 3 - destructing the user's id
    const { _id } = req.authUser;
    // 4 - find the company that related to that HR
    const requirdCompany = await Company.findOne({companyName});
    // 5 - destructing the required skills
    const { userTechSkills, userSoftSkills } = req.body;
    // 6 - create userResume object
    let userResume = {
        secure_url: '',
        public_id: ''
    }
    // 7 - check if the user uploaded resume
    if (!req.file) {
        userResume = {
            secure_url: '',
            public_id: ''
        }
    } else {
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_MEDIA_FOLDER}/COMPANIES/${requirdCompany.companyHostFolderId}/JOBS/${requiredJob.jobTitle}/users_CVs`
        })
        // 7.1 - store the folder for rollback
        req.folder = `${process.env.MAIN_MEDIA_FOLDER}/COMPANIES/${requirdCompany.companyHostFolderId}/JOBS/${requiredJob.jobTitle}/users_CVs`;
        userResume = {
            secure_url,
            public_id
        }
    }
    // 8 - create the job application object 
    const newApplication = {
        jobId,
        userId: _id,
        userTechSkills,
        userSoftSkills,
        userResume
    }
    // 9 - create the job application document in DB
    const jobApplication = await Application.create(newApplication);
    // 10 - add the data of the new document to the request object for the rollback 
    req.savedDocument = { model: Application, _id: jobApplication._id };
    // 11 - check if the job application created
    if (!jobApplication) {
        return next(new Error('Failed to apply to the job', { cause: 500 }));
    }
    // 12 - return the response
    return res.status(201).json({
        success: true,
        message: 'Job application sent successfully',
        data: jobApplication
    });
}