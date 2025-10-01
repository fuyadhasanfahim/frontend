import React from 'react';
import { Metadata } from 'next';
import SignInForm from '@/components/(auth)/sign-in/SigninForm';

export const metadata: Metadata = {
    title: 'Sign In | Job Portal',
};

export default function SignUpPage() {
    return <SignInForm />;
}
