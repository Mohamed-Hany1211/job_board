// files imports
import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
    ADD_JOB : systemRoles.COMPANY_HR,
    GET_ALL_JOBS_FOR_SPECIFIC_COMPANY : [systemRoles.COMPANY_HR,systemRoles.USER],
    APPLY_FOR_JOB : systemRoles.USER
}