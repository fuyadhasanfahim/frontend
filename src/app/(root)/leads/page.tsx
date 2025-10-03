import React from 'react';
import RootLeadsPage from '@/components/(root)/leads/RootLeadsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Leads | Job Portal',
};

export default function page() {
    return <RootLeadsPage />;
}
