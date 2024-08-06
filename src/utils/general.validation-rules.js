// modules imports
import Joi from "joi";
import { Types } from "mongoose";

// function to validate the object id
export const objectIdValidation = (value,helper)=>{
    const isValid = Types.ObjectId.isValid(value)
    return(isValid? value : helper.message('invalid objectId'))
}

// object that specify general validations for headers and DB id's
export const generalRules = {
    dbId:Joi.string().custom(objectIdValidation),
    headersRules:Joi.object({
        accesstoken:Joi.string(),
        'postman-token':Joi.string(),
        'content-length':Joi.string(),
        host:Joi.string().required(),
        'user-agent':Joi.string().required(),
        accept:Joi.string(),
        'accept-encoding':Joi.string(),
        'content-type':Joi.string(),
        connection:Joi.string()
    })
}