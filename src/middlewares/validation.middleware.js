// middleware to validate the data came from 'body','params','headers','query'
const reqKeys = ['body','params','headers','query'];
/*
    // 1 - array to store errors 
    // 2 - looping on reqKeys to check if there are any errors  
    // 3 - if there are errors, return the errors in the response
*/
export const validationMiddleware = (schema) =>{
    return (req,res,next) =>{
        // 1 - array to store errors 
        let validationErrorsArray = [];
        // 2 - looping on reqKeys to check if there are any errors  
        for(const key of reqKeys){
            const validationResult = schema[key]?.validate(req[key],{abortEarly:false});
            if(validationResult?.error){
                validationErrorsArray.push(...validationResult.error.details)
            }
        }
        // 3 - if there are errors, return the errors in the response
        if(validationErrorsArray.length){
            return res.json({
                errors:validationErrorsArray.map(ele => ele.message)
            })
        }
        next();
    }
}