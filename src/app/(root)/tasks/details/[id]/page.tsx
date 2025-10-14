import React from 'react';
import RootTaskDetailsPage from '@/components/(root)/tasks/details/RootTaskDetailsPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Task Details | Job Portal',
    description: 'This is the leads page',
};

export default function TaskDetailsPage() {
    return <RootTaskDetailsPage />;
}
