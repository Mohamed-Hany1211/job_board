// modules imports
import { Schema, model } from "mongoose";
// files imports
import { joblocation } from "../../src/utils/job-location.js";
import { workingtime } from "../../src/utils/working-time.js";
import { senioritylevel } from "../../src/utils/seniority-level.js";
const jobSchema = new Schema({
    jobTitle:{
        type:String,
        required:true,
        minlength:3,
        trim:true
    },
    jobLocation:{
        type:String,
        enum:[joblocation.ONSITE,joblocation.REMOTELY,joblocation.HYBRID],
        default:joblocation.ONSITE
    },
    workingTime:{
        type:String,
        enum:[workingtime.FULLTIME,workingtime.PARTTIME],
        default:workingtime.FULLTIME
    },
    seniorityLevel:{
        type:String,
        enum:[senioritylevel.JUNIOR,senioritylevel.MID_LEVEL,senioritylevel.SENIOR,senioritylevel.TEAM_LEAD,senioritylevel.CTO],
        default:senioritylevel.JUNIOR
    },
    jobDescription:{
        type:String,
        required:true
    },
    technicalSkills:[String],
    softSkills:[String],
    addedBy:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    }
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

// virtual populate for companies info 
jobSchema.virtual('Company',{
    ref:'company',
    localField:'addedBy',
    foreignField:'companyHR'
})

// virtual populate for applications 
jobSchema.virtual('Applications',{
    ref:'application',
    localField:'_id',
    foreignField:'jobId'
})


export default model('job',jobSchema);


