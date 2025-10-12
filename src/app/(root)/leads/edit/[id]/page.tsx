import React from 'react';
import RootLeadsEditPage from '@/components/(root)/leads/edit/RootLeadsEditPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Edit Lead | Job Portal',
    description: 'This is the new leads page',
};

export default function LeadsEditPage() {
    return <RootLeadsEditPage />;
}
