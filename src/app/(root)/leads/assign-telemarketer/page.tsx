import React from 'react';
import { Metadata } from 'next';
import RootTelemarketingPage from '@/components/(root)/telemarketing/RootTelemarketingPage';

export const metadata: Metadata = {
    title: 'Assign Telemarketer | Job Portal',
    description: 'Assign Telemarketer to Leads',
};

export default function AssignTelemarketerPage() {
    return <RootTelemarketingPage />;
}
