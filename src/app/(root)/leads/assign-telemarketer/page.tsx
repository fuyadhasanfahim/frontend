import React from 'react';
import { Metadata } from 'next';
import RootAssignTelemarketerPage from '@/components/(root)/leads/assign-telemarketer/RootAssignTelemarketerPage';

export const metadata: Metadata = {
    title: 'Assign Telemarketer | Job Portal',
    description: 'Assign Telemarketer to Leads',
};

export default function AssignTelemarketerPage() {
    return <RootAssignTelemarketerPage />;
}
