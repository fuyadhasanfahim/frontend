import React from 'react';
import { Metadata } from 'next';
import RootLeadCreateTaskPage from '@/components/(root)/tasks/create-task/RootLeadCreateTaskPage';

export const metadata: Metadata = {
    title: 'Create Task | Job Portal',
    description: 'This is the leads page',
};

export default function LeadCreateTaskPage() {
    return <RootLeadCreateTaskPage />;
}
