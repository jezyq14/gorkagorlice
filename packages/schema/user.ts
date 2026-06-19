export const UserRoles = {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    TEACHER: 'teacher',
    STUDENT_COUNCIL: 'student_council',
    CLASS_PRESIDENT: 'class_president',
    CLASS_VICE_PRESIDENT: 'class_vice_president',
    CLASS_TREASURER: 'class_treasurer',
    STUDENT: 'student',
    USER: 'user'
} as const;

export type UserRole = typeof UserRoles[keyof typeof UserRoles];