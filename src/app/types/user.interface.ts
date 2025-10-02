export interface IUser {
    firstName: string;
    lastName?: string;
    email: string;
    phone: string;
    image?: string;
    resetPasswordToken?: string;
    resetPasswordExpiry?: Date;

    role:
        | 'super-admin'
        | 'admin'
        | 'telemarketer'
        | 'digital-marketer'
        | 'seo-executive'
        | 'social-media-executive'
        | 'web-developer'
        | 'photo-editor'
        | 'graphic-designer';

    teamId?: string;
    isActive: boolean;
    lastLogin?: Date;

    emailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpiry?: Date;
}
