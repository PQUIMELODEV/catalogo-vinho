export type UserRole = 'admin' | 'cliente';

export interface UserProfile {
    id: string;
    name: string;
    role: UserRole;
    avatar?: string;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    profiles: UserProfile[];
    activeProfile?: UserProfile;
    token: string;
}
