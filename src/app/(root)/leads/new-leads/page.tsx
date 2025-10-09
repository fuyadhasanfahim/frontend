import React from 'react';
import { Metadata } from 'next';
import RootNewLeadsPage from '@/components/(root)/leads/new-leads/RootNewLeadsPage';

export const metadata: Metadata = {
    title: 'New Leads | Job Portal',
    description: 'This is the new leads page',
};

export default function NewLeadsPage() {
    return <RootNewLeadsPage />;
}
