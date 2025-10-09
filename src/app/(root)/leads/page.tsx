import React from 'react';
import RootLeadsPage from '@/components/(root)/leads/RootLeadsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Leads | Job Portal',
    description: 'This is the leads page',
};

export default function LeadsPage() {
    return <RootLeadsPage />;
}
