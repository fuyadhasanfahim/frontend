import React from 'react';
import { Metadata } from 'next';
import RootTelemarketingPage from '@/components/(root)/telemarketing/RootTelemarketingPage';

export const metadata: Metadata = {
    title: 'Telemarketing | Job Portal',
    description: 'This is the telemarketing page',
};

export default function TelemarketingPage() {
    return <RootTelemarketingPage />;
}
