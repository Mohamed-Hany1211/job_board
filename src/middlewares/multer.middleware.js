import multer from 'multer';
import { allowedExtensions } from '../utils/allowed-extension.js';

// function to deal with files to upload them on a host
export const multerMiddlewareHost = ({
    extinsions = allowedExtensions.document||allowedExtensions.image
}) =>{

    const storage = multer.diskStorage({});
    const fileFilter = (req, file, cb) => {
        if(extinsions.includes(file.mimetype.split('/')[1])){
            return cb(null, true);
        }
        cb(new Error(`Invalid Extension`),false);
    }

    const file = multer({fileFilter,storage});
    return file;
} 
