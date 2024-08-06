// modules imports
import {Router} from 'express';
import asyncHandler from 'express-async-handler';
// files imports
import * as companyController from './company.controller.js';
import { auth } from '../../middlewares/auth.middleware.js';
import { endPointsRoles } from './company.endPoints.js';
import {validationMiddleware} from '../../middlewares/validation.middleware.js';
import { addCompanySchema ,updateCompanySchema} from './company.validation-schema.js';
import { multerMiddlewareHost } from '../../middlewares/multer.middleware.js';
import { allowedExtensions } from '../../utils/allowed-extension.js';



const router = Router();
router.post('/addCompany',auth(endPointsRoles.ADD_COMPANY),validationMiddleware(addCompanySchema),multerMiddlewareHost({extinsions:allowedExtensions.image}).single('logo'),asyncHandler(companyController.addCompany));
router.put('/updateCompanyData',auth(endPointsRoles.ADD_COMPANY),validationMiddleware(updateCompanySchema),multerMiddlewareHost({extinsions:allowedExtensions.image}).single('newLogo'),asyncHandler(companyController.updateCompanyData));
router.delete('/deleteCompanyData',auth(endPointsRoles.ADD_COMPANY),asyncHandler(companyController.deleteCompanyData));
router.get('/searchForCompanyWithAName',auth(endPointsRoles.SEARCH_FOR_COMPANY),asyncHandler(companyController.searchForCompanyWithAName));
router.get('/getCompanyData/:companyId',auth(endPointsRoles.ADD_COMPANY),asyncHandler(companyController.getCompanyData));
router.get('/GetAllApplicationsForSpecificJob',auth(endPointsRoles.ADD_COMPANY),asyncHandler(companyController.GetAllApplicationsForSpecificJob));










export default router;