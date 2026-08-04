import { UserRole } from "@prisma/client";
import { userManagementData } from "../../data/UserManagement/UserManagement.data.js";

export const userManagementService = {
  list(query: { keyword?: string; role?: UserRole }) {
    return userManagementData.list(query);
  },

  async changeRole(actorId: number, targetId: number, role: UserRole) {
    if (actorId === targetId) throw new Error("CANNOT_CHANGE_OWN_ROLE");
    const target = await userManagementData.find(targetId);
    if (!target) throw new Error("USER_NOT_FOUND");
    if (target.role === UserRole.ADMIN && role !== UserRole.ADMIN && target.isActive && await userManagementData.countActiveAdmins() <= 1) {
      throw new Error("LAST_ACTIVE_ADMIN");
    }
    return userManagementData.updateRole(targetId, role);
  },

  async changeActive(actorId: number, targetId: number, isActive: boolean) {
    if (actorId === targetId) throw new Error("CANNOT_CHANGE_OWN_STATUS");
    const target = await userManagementData.find(targetId);
    if (!target) throw new Error("USER_NOT_FOUND");
    if (!isActive && target.role === UserRole.ADMIN && target.isActive && await userManagementData.countActiveAdmins() <= 1) {
      throw new Error("LAST_ACTIVE_ADMIN");
    }
    return userManagementData.updateActive(targetId, isActive);
  },
};
