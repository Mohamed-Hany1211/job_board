// modules imports
import { Router } from "express";
import asyncHandler from 'express-async-handler';
// files imports
import * as jobController from './job.controller.js';
import { endPointsRoles } from "./job.endPoints.js";
import { auth } from "../../middlewares/auth.middleware.js";
import {multerMiddlewareHost} from '../../middlewares/multer.middleware.js'
import { allowedExtensions } from "../../utils/allowed-extension.js";
import {validationMiddleware} from '../../middlewares/validation.middleware.js';
import { addJobSchema } from "./job.validation-schema.js";



const router = Router();


router.post('/addJob',auth(endPointsRoles.ADD_JOB),validationMiddleware(addJobSchema),asyncHandler(jobController.addJob));
router.post('/applyToJob',auth(endPointsRoles.APPLY_FOR_JOB),multerMiddlewareHost({extinsions:allowedExtensions.document}).single('resume'),asyncHandler(jobController.applyToJob));
router.put('/updateJob',auth(endPointsRoles.ADD_JOB),validationMiddleware(addJobSchema),asyncHandler(jobController.updateJob));
router.delete('/deleteJob',auth(endPointsRoles.ADD_JOB),asyncHandler(jobController.deleteJob));
router.get('/getAllJobsForSpecificCompany',auth(endPointsRoles.GET_ALL_JOBS_FOR_SPECIFIC_COMPANY),asyncHandler(jobController.getAllJobsForSpecificCompany));
router.get('/getAllJobsWithCompaniesInfo',auth(endPointsRoles.GET_ALL_JOBS_FOR_SPECIFIC_COMPANY),asyncHandler(jobController.getAllJobsWithCompaniesInfo));
router.get('/getJobsWithFilter',auth(endPointsRoles.GET_ALL_JOBS_FOR_SPECIFIC_COMPANY),asyncHandler(jobController.getJobsWithFilter));







export default router;
