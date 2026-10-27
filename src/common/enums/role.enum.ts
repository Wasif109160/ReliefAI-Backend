export enum Role {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  NGO = "ngo",
  VOLUNTEER = "volunteer",
  CITIZEN = "citizen",
  RESCUE_TEAM = "rescue_team",
  GOVERNMENT = "government",
  COMMANDER = "commander",
  RESPONDER = "responder",
}

export const RoleHierarchy: { [key in Role]: number } = {
  [Role.SUPER_ADMIN]: 9,
  [Role.ADMIN]: 8,
  [Role.GOVERNMENT]: 7,
  [Role.COMMANDER]: 6,
  [Role.RESCUE_TEAM]: 5,
  [Role.RESPONDER]: 4,
  [Role.NGO]: 3,
  [Role.VOLUNTEER]: 2,
  [Role.CITIZEN]: 1,
};
