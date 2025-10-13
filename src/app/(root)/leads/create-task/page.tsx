import RootLeadCreateTaskPage from '@/components/(root)/leads/create-task/RootLeadCreateTaskPage';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Create Task | Job Portal',
    description: 'This is the leads page',
};

export default function LeadCreateTaskPage() {
    return <RootLeadCreateTaskPage />;
}
