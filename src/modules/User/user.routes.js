// modules imports
import { Router } from "express";
import asyncHandler from "express-async-handler";
// files imports
import * as userController from './user.controller.js';
import {multerMiddlewareHost} from '../../middlewares/multer.middleware.js';
import { allowedExtensions } from "../../utils/allowed-extension.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { signUpSchema } from "./user.validation-schema.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { endPointsRoles } from "./user.endPoints.js";



const router = Router();

router.post('/signUp',validationMiddleware(signUpSchema),multerMiddlewareHost({extinsions:allowedExtensions.image}).single('pic'),asyncHandler(userController.signUp));
router.post('/signIn',asyncHandler(userController.signIn));
router.get('/verify-email',asyncHandler(userController.verifyEmail));
router.put('/updateAccount',auth(endPointsRoles.USER_OPERATIONS),validationMiddleware(signUpSchema),multerMiddlewareHost({extinsions:allowedExtensions.image}).single('newPic'),asyncHandler(userController.updateAccount));
router.delete('/deleteAccount',auth(endPointsRoles.USER_OPERATIONS),asyncHandler(userController.deleteAccount));
router.get('/getUserAccountData',auth(endPointsRoles.USER_OPERATIONS),asyncHandler(userController.getUserAccountData));
router.get('/getAnyUsersProfile/:_id',asyncHandler(userController.getAnyUsersProfile));
router.get('/getAllAccountsByEmail',asyncHandler(userController.getAllAccountsByEmail));
router.patch('/updatePassword',auth(endPointsRoles.USER_OPERATIONS),asyncHandler(userController.updatePassword));
router.patch('/forgetPassword',asyncHandler(userController.forgetPassword));
router.patch('/resetPassword',asyncHandler(userController.resetPassword));






export default router;