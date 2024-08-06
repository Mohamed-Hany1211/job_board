// files imports
import { systemRoles } from "../../utils/system-roles.js";

export const endPointsRoles = {
    ADD_COMPANY : systemRoles.COMPANY_HR,
    SEARCH_FOR_COMPANY : [systemRoles.COMPANY_HR,systemRoles.USER]
}