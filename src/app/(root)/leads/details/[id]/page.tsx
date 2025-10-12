import React from 'react';
import RootLeadsDetailsPage from '@/components/(root)/leads/details/RootLeadsDetailsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Lead Details | Job Portal',
    description: 'This is the new leads page',
};

export default function LeadsDetailsPage() {
    return <RootLeadsDetailsPage />;
}
