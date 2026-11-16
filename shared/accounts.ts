export const AVATARS = { mascot: '/assets/surveys/mascot.webp', reading: '/assets/surveys/avatar-reading.webp', logo: '/assets/surveys/logo.webp' } as const;
export const TEST_ICONS = ['Zap', 'Heart', 'Users', 'Clock', 'School', 'AlertCircle'] as const;
export const TEST_COLORS = ['primary', 'secondary', 'orange'] as const;
export type SchoolDto = {
    id: string;
    name: string;
    address: string;
    status: 'active' | 'archived';
    revision: number;
};
export type ClassDto = {
    id: string;
    schoolId: string;
    name: string;
    academicYear: string;
    status: 'active' | 'archived';
    revision: number;
    homeroomTeacherId: string | null;
    homeroomTeacherName: string | null;
    studentCount: number;
};
export type ManagedUser = {
    id: string;
    username: string;
    role: 'student' | 'teacher' | 'admin' | 'superadmin';
    status: string;
    revision: number;
    activationPending: boolean;
    canRestore:boolean;
    emailVerified: boolean;
    schoolId: string | null;
    classId: string | null;
    profile: {
        name: string;
        email: string;
        phone: string;
        birthYear: string;
        gender: string;
        bio: string;
        avatarKey: keyof typeof AVATARS;
        school: string;
        className: string;
        teacherType: string;
        subject: string;
    };
    allowedActions: string[];
};
