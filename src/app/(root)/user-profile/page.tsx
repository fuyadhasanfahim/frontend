import RootUserProfilePage from '@/components/(root)/user-profile/RootUserProfilePage';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'User Profile | Job Portal',
    description: 'User Profile Page',
};

export default function UserProfilePage() {
    return <RootUserProfilePage />;
}
