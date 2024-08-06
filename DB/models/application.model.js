// modules imports
import { Schema, model } from "mongoose";

const applicationSchema = new Schema({
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'job',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    userTechSkills: [String],
    userSoftSkills: [String],
    userResume: {
        secure_url: { type: String,required:true},
        public_id: { type: String,required:true}
    },
    resumFolderId:{
        type: String,
        trim: true
    }
}, { 
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true } 
});

// virtual populate for user info

applicationSchema.virtual('User',{
    ref: 'user',
    localField: 'userId',
    foreignField: '_id',
})

export default model('application', applicationSchema);