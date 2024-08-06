// modules imports
import { Schema, model } from 'mongoose';
import { DateTime } from 'luxon';
// files imports
import { systemRoles } from '../../src/utils/system-roles.js';
import { userStatus } from '../../src/utils/user-status.js';

const userSchema = new Schema({
    firstName: {
        type: String,
        minlength: 3,
        trim: true
    },
    lastName: {
        type: String,
        minlength: 3,
        trim: true
    },
    userName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        minlength: 6
    },
    recoveryEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    role: {
        type: String,
        enum: [systemRoles.USER, systemRoles.COMPANY_HR],
        default: systemRoles.USER
    },
    userStatus: {
        type: String,
        enum: [userStatus.ONLINE, userStatus.OFFLINE],
        default: userStatus.OFFLINE
    },
    mobileNumber: {
        type: String,
        trim: true,
        unique: true,
    },
    DOB: {
        type:String
    },
    userImg:{
        secure_url: { type: String },
        public_id: { type: String }
    },
    mediaFolderId:{
        type: String,
        trim: true
    },
    isEmailVerified:{
        type: Boolean,
        default: false
    },
    OTP:{
        type: String,
        default:''
    }
}, { timestamps: true });

export default model('user', userSchema);