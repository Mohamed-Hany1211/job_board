// modules imports
import { Schema, model } from "mongoose";

const companySchema = new Schema({
    companyName: {
        type: String,
        unique: true,
        trim: true,
    },
    description: String,
    industry: {
        type: String
    },
    address: {
        type: String
    },
    numberOfEmployees: {
        type: Number,
        min: 10
    },
    companyEmail: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true
    },
    companyHR: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        unique: true
    },
    logo:{
        secure_url: { type: String },
        public_id: { type: String }
    },
    companyHostFolderId:{
        type: String,
        trim: true
    }
}, { 
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

// virtual populate for jobs info
companySchema.virtual('Jobs', {
    ref: 'job',
    localField: 'companyHR',
    foreignField: 'addedBy'
});

export default model('company', companySchema);