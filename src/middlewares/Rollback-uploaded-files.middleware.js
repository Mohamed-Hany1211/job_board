// files imports
import cloudinaryConnection from '../utils/cloudinary.js';


/* 
    @param req.folder
    @description => delete the uplouded files from cloudinary
*/
export const rollbackUploadedFiles = async (req,res,next)=>{
    if(req.folder){
        await cloudinaryConnection().api.delete_resources_by_prefix(req.folder);
        await cloudinaryConnection().api.delete_folder(req.folder);
    }
    next();
}