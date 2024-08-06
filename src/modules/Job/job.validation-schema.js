// modules imports
import Joi from 'joi';
// files imports
import { generalRules } from '../../utils/general.validation-rules.js';

// validation schema

export const addJobSchema = {
    body: Joi.object({
        jobTitle: Joi.string().required().min(3).trim(),
        jobDescription: Joi.string().required(),
        jobLocation: Joi.string(),
        workingTime: Joi.string(),
        seniorityLevel: Joi.string(),
        technicalSkills:Joi.array(),
        softSkills:Joi.array()
    }),
    headers: generalRules.headers
}

