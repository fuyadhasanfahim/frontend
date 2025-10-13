import RootTaskPage from '@/components/(root)/tasks/RootTaskPage';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Tasks | Job Portal',
    description: 'This is the leads page',
};

export default function TaskPage() {
    return <RootTaskPage />;
}
