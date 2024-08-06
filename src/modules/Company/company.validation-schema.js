// modules imports
import Joi from 'joi';
// files imports
import { generalRules } from '../../utils/general.validation-rules.js';

// validation schema

export const addCompanySchema = {
    body: Joi.object({
        companyName: Joi.string().min(3).trim(),
        description: Joi.string(),
        industry: Joi.string(),
        address: Joi.string(),
        numberOfEmployees: Joi.number(),
        companyEmail:Joi.string().trim().lowercase()
    }),
    headers: generalRules.headers,
    
}

export const updateCompanySchema = {
    body: Joi.object({
        newCompanyName: Joi.string().min(3).trim(),
        newDescription: Joi.string(),
        newIndustry: Joi.string(),
        newAddress: Joi.string(),
        newNumberOfEmployees: Joi.number(),
        newCompanyEmail:Joi.string().trim().lowercase()
    }),
    headers: generalRules.headers
}