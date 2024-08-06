// files imports
import Company from '../../../DB/models/company.model.js';
import Job from '../../../DB/models/job.model.js';
import Application from '../../../DB/models/application.model.js';
import cloudinaryConnection from '../../utils/cloudinary.js';
// ============================= add company ======================== //
/*
    // 1 - destructing the required data
    // 2 - destructing the id of company HR (which is logged in also)
    // 3  - check if the HR duplicated
    // 4 - check if the company is already exist
    // 5 - check on number of employees 
    // 6 - create the company's logo object
    // 7 - check if the HR uploaded the logo
        // 7.1 - add the folder in request object so that if any error occure while uploading the logo it will not upload due to rollback 
    // 8 - creating the company's object
    // 9 - check if the company's logo is uploaded
    // 10 - saving the company to DB
    // 11 - add the data of the new document to the request object for the rollback 
    // 12 - check if company's document created
    // 13 - return the response
*/
export const addCompany = async (req, res, next) => {
    // 1 - destructing the required data
    const {
        companyName,
        description,
        industry,
        address,
        numberOfEmployees,
        companyEmail
    } = req.body;
    // 2 - destructing the id of company HR (which is logged in also)
    const { _id } = req.authUser;
    // 3  - check if the HR duplicated
    const HRduplicated = await Company.findOne({ companyHR: _id });
    if (HRduplicated) {
        return next(new Error('You cannot add more than one company', { cause: 409 }));
    };
    // 4 - check if the company is already exist
    const companyExist = await Company.findOne({
        $or: [
            { companyName },
            { companyEmail }
        ]
    });
    if (companyExist) {
        return next(new Error('Company already exist', { cause: 409 }));
    };
    // 5 - check on number of employees 
    if (+numberOfEmployees < 10) {
        return next(new Error('Company should have at least 10 employees', { cause: 400 }));
    };

    // 6 - create the company's logo object
    let companyLogo = {
        secure_url: '',
        public_id: ''
    }
    // 7 - check if the HR uploaded the logo
    if (!req.file) {
        companyLogo = {
            secure_url: '',
            public_id: ''
        }
    } else {
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_MEDIA_FOLDER}/COMPANIES/${companyName}/company_logo`
        })
        // 7.1 - add the folder in request object so that if any error occure while uploading the logo it will not upload due to rollback 
        req.folder = `${process.env.MAIN_MEDIA_FOLDER}/COMPANIES/${companyName}/company_logo`;
        companyLogo = {
            secure_url,
            public_id
        }
    }

    // 8 - creating the company's object
    const newCompany = {
        companyName,
        description,
        industry,
        address,
        numberOfEmployees,
        companyEmail,
        logo: companyLogo,
        companyHR: _id,
        companyHostFolderId: ''
    }

    // 9 - check if the company's logo is uploaded
    if (companyLogo.public_id === '' && companyLogo.secure_url === '') {
        newCompany.companyHostFolderId = '';
    } else {
        newCompany.companyHostFolderId = companyName;
    }


    // 10 - saving the company to DB
    const createdCompany = await Company.create(newCompany);
    // 11 - add the data of the new document to the request object for the rollback 
    req.savedDocument = { model: Company, _id: createdCompany._id };
    // 12 - check if company's document created
    if (!createdCompany) {
        return next(new Error('Failed to create company', { cause: 500 }));
    };
    // 13 - return the response
    res.status(201).json({
        success: true,
        message: 'Company created successfully',
        data: createdCompany
    });
}

// ============================= Update company data ================== //
/*
    // 1 - destructing the required data
    // 2 - destructing the id of the company
    // 3 - check if the company exist
    // 4 - check if the HR wants to update the company name
        // 4.1 - check if the new name is not equal to the old one
        // 4.2 - if the two names are diffrent then we update the value of the old name
    // 5 - check if the HR wants to update the company email
        // 5.1 - check if the new email is not equal to the old one
        // 5.2 - if the two emails are diffrent then we update the value of the old email
    // 6 - check if the HR wants to change company's logo
        // 6.1 - we delete the old logo from cloudinary
        // 6.2 - we update the value of the old logo
        // 6.3 - store the folder for rollback
        // 6.4 - update the logo object
    // 7 - update the rest of data
    // 8 - save the updated company data
    // 9 - return the response
*/
export const updateCompanyData = async (req, res, next) => {
    // 1 - destructing the required data
    const {
        newCompanyName,
        newDescription,
        newIndustry,
        newAddress,
        newNumberOfEmployees,
        newCompanyEmail
    } = req.body;
    const { oldPublicId } = req.query;
    // 2 - destructing the id of the company
    const { _id } = req.authUser;
    // 3 - check if the company exist
    const companyExist = await Company.findOne({ companyHR: _id });
    if (!companyExist) {
        return next(new Error('Company not found', { cause: 404 }));
    };
    // 4 - check if the HR wants to update the company name
    if (newCompanyName) {
        // 4.1 - check if the new name is not equal to the old one
        if (newCompanyName === companyExist.companyName) {
            return next(new Error('new company name should be different from old one', { cause: 400 }));
        }
        // 4.2 - if the two names are diffrent then we update the value of the old name
        companyExist.companyName = newCompanyName;
    }
    // 5 - check if the HR wants to update the company email
    if (newCompanyEmail) {
        // 5.1 - check if the new email is not equal to the old one
        if (newCompanyEmail === companyExist.companyEmail) {
            return next(new Error('new company email should be different from old one', { cause: 400 }));
        }
        // 5.2 - if the two emails are diffrent then we update the value of the old email
        companyExist.companyEmail = newCompanyEmail;
    }


    // 6 - check if the HR wants to change company's logo
    if (oldPublicId) {
        // 6.1 - we delete the old logo from cloudinary
        await cloudinaryConnection().uploader.destroy(oldPublicId);
        // 6.2 - we update the value of the old logo
        const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
            folder: `${process.env.MAIN_MEDIA_FOLDER}/COMPANIES/${companyExist.companyHostFolderId}/company_logo`
        });
        // 6.3 - store the folder for rollback
        req.folder = `${process.env.MAIN_MEDIA_FOLDER}/COMPANIES/${companyExist.companyHostFolderId}/company_logo`;
        // 6.4 - update the logo object
        companyExist.logo = {
            secure_url,
            public_id
        }
    }


    // 7 - update the rest of data
    companyExist.description = newDescription;
    companyExist.industry = newIndustry;
    companyExist.address = newAddress;
    companyExist.numberOfEmployees = newNumberOfEmployees;
    // 8 - save the updated company data
    await companyExist.save();
    // 9 - return the response
    res.status(200).json({
        success: true,
        message: 'Company data updated successfully',
        data: companyExist
    });
}

// =========================== Delete company data ================== //
/*
    // 1 - destructing the id of the company HR
    // 2 - check if the company exist and delete it
    // 3 - check if the company found
    // 4 - find all jobs that related to that company
    // 5 - delete all related jobs to that company
    // 6 - delete all applications applied to the deleted jobs
    // 7 - delete the company's folder from cloudinary
    // 8 - return the response
*/
export const deleteCompanyData = async (req, res, next) => {
    // 1 - destructing the id of the company HR
    const { _id } = req.authUser;
    // 2 - check if the company exist and delete it
    const deletedCompany = await Company.findOneAndDelete({ companyHR: _id });
    // 3 - check if the company found
    if (!deletedCompany) {
        return next(new Error('Company not found', { cause: 404 }));
    };
    // 4 - find all jobs that related to that company
    const relatedJobs = await Job.find({addedBy:_id});
    if (!relatedJobs.length) {
        return next(new Error(`no related jobs found`,{cause:404}));
    };
    // 5 - delete all related jobs to that company
    const DeleteRelatedJobs = await Job.deleteMany({ addedBy: _id });
    if (DeleteRelatedJobs.deletedCount <= 0) {
        console.log('no related jobs to delete');
    };
    // 6 - delete all applications applied to the deleted jobs
    for(let i = 0 ; i< relatedJobs.length ; i++){
        await Application.deleteMany({jobId:relatedJobs[i]._id});
    }
    // 7 - delete the company's folder from cloudinary
    await cloudinaryConnection().api.delete_resources_by_prefix(`${process.env.MAIN_MEDIA_FOLDER}/COMPANIES/${deletedCompany.companyHostFolderId}`);
    await cloudinaryConnection().api.delete_folder(`${process.env.MAIN_MEDIA_FOLDER}/COMPANIES/${deletedCompany.companyHostFolderId}`);
    // 8 - return the response
    res.status(200).json({
        success: true,
        message: 'Company data deleted successfully'
    });
}

// ========================= Search for a company with a name ================= //
/*
    // 1 - destructing the company name
    // 2 - find companies with the given name
    // 3 - return the response
*/
export const searchForCompanyWithAName = async (req, res, next) => {
    // 1 - destructing the company name
    const { companyName } = req.body;
    // 2 - find companies with the given name
    const searchedCompany = await Company.findOne({ companyName });
    if (!searchedCompany) {
        return next(new Error('Company not found', { cause: 404 }));
    };
    // 3 - return the response
    res.status(200).json({
        success: true,
        message: 'Company found successfully',
        data: searchedCompany
    });
}

// ======================== Get company data =========================== //
/*
    // 1 - destructing the id of the company
    // 2 - destructing the id of the signedIn user
    // 3 - find company with the given id
    // 4 - check if the company exist
    // 5 - return the response
*/
export const getCompanyData = async (req, res, next) => {
    // 1 - destructing the id of the company
    const { companyId } = req.params;
    // 2 - destructing the id of the signedIn user
    const { _id } = req.authUser;
    // 3 - find company with the given id
    const companyExist = await Company.findOne({ _id: companyId, companyHR: _id }).populate([{
        path: 'Jobs'
    }]);
    // 4 - check if the company exist
    if (!companyExist) {
        return next(new Error('Company not found', { cause: 404 }));
    };
    // 5 - return the response
    res.status(200).json({
        success: true,
        message: 'Company data found successfully',
        data: companyExist
    });
}

// ========================= Get all applications for specific Jobs ================= //
/*
    // 1 - destructing the id of the signedIn user
    // 2 - finding the applications with user's data
    // 3 - check if the applications found
    // 4 - return the response
*/
export const GetAllApplicationsForSpecificJob = async (req, res, next) => {
    // 1 - destructing the id of the signedIn user
    const { _id } = req.authUser;
    // 2 - finding the applications with user's data
    const applications = await Company.findOne({ companyHR: _id }).populate([{
        path: 'Jobs',
        populate: [{
            path: 'Applications',
            populate: [{
                path: 'User'
            }]
        }]
    }]);
    // 3 - check if the applications found
    if (!applications) {
        return next(new Error('Applications not found', { cause: 404 }));
    }
    // 4 - return the response
    res.status(200).json({
        success: true,
        message: 'Applications found successfully',
        data: applications
    });
}