import React from 'react';
import { Metadata } from 'next';
import SignUpForm from '@/components/(auth)/sign-up/SignUpForm';

export const metadata: Metadata = {
    title: 'Sign Up | Job Portal',
};

export default function SignUpPage() {
    return <SignUpForm />;
}
