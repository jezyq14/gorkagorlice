import type { User, Class } from '@repo/db';
import { UserRoles, UserRole } from './user';

export type Permissions = {
    adminPanel: {
        dataType: null;
        action: "view" | "edit";
    };
    users: {
        dataType: User;
        action: "search" | "delete" | "edit";
    };
    classes: {
        dataType: Class;
        action: "create" | "edit" | "manage_finance";
    };
    permissions: {
        dataType: null;
        action: "self";
    };
};

type PermissionCheck<Key extends keyof Permissions> =
    | boolean
    | ((user: User, data: Permissions[Key]["dataType"]) => boolean);

type RolesWithPermissions = {
    [R in UserRole]?: Partial<{
        [Key in keyof Permissions]: Partial<{
            [Action in Permissions[Key]["action"]]: PermissionCheck<Key>;
        }>;
    }>;
};

export const ROLES_CONFIG: RolesWithPermissions = {
    [UserRoles.ADMIN]: {
        adminPanel: { view: true, edit: true },
        users: {
            search: true,
            edit: true,
            delete: (user, targetUser) => {
                if (user.id === targetUser.id) return false;
                if (targetUser.roles.includes(UserRoles.ADMIN)) return false;
                return true;
            },
        },
        classes: { create: true, edit: true },
        permissions: { self: true },
    },
    [UserRoles.MODERATOR]: {
        adminPanel: { view: true },
        users: { search: true },
        classes: { create: true, edit: true },
    },
    [UserRoles.CLASS_PRESIDENT]: {
        classes: {
            edit: (user, classData) => user.classId === classData.id,
        },
    },
    [UserRoles.CLASS_TREASURER]: {
        classes: {
            manage_finance: (user, classData) => user.classId === classData.id,
        },
    },
} as const;

export function hasPermission<Resource extends keyof Permissions>(
    user: User | null | undefined,
    resource: Resource,
    action: Permissions[Resource]["action"],
    data?: Permissions[Resource]["dataType"],
): boolean {
    if (!user) return false;

    return user.roles.some((role) => {
        const roleConfig = ROLES_CONFIG[role as UserRole];
        if (!roleConfig) return false;

        const resourceConfig = roleConfig[resource];
        if (!resourceConfig) return false;

        const permission = (resourceConfig as any)[action];

        if (permission == null) return false;
        if (typeof permission === "boolean") return permission;

        return data !== undefined && permission(user, data);
    });
}