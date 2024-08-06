// modules imports
import Joi from "joi";
// files imports
import { generalRules } from "../../utils/general.validation-rules.js";

// validation schema
export const signUpSchema = {
    body: Joi.object({
        firstName: Joi.string(),
        lastName: Joi.string(),
        email: Joi.string().email(),
        password: Joi.string(),
        recoveryEmail: Joi.string().email(),
        mobileNumber: Joi.string().min(11).max(11),
        DOB:Joi.date(),
        role:Joi.string()
    }).required(),
    headers:generalRules.headersRules
}