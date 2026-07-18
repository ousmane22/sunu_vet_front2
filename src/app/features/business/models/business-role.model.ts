export interface BusinessRolePermission {
  id: number;
  name: string;
  label?: string;
}

export interface BusinessRole {
  id: number;
  name: string;
  permissions?: BusinessRolePermission[];
  permission_ids?: number[];
}

export interface BusinessRoleListResponse {
  data: BusinessRole[];
}

export interface BusinessRoleSingleResponse {
  data: BusinessRole;
  message?: string;
}

export interface CreateBusinessRolePayload {
  name: string;
  permission_ids?: number[];
}

export interface UpdateBusinessRolePayload {
  name?: string;
  permission_ids?: number[];
}

export interface PermissionOption {
  id: number;
  name: string;
  label?: string;
}

/** Groupe de permissions pour l’affichage (UX). */
export interface PermissionGroup {
  group_key: string;
  group_label: string;
  permissions: PermissionOption[];
}

export interface AvailablePermissionsResponse {
  data: PermissionOption[] | PermissionGroup[];
}

/** Réponse groupée (liste de groupes). */
export interface GroupedPermissionsResponse {
  data: PermissionGroup[];
}




