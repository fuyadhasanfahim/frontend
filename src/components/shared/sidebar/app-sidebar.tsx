'use client';

import * as React from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { NavMain } from './nav-main';
import Link from 'next/link';
import { IconFileTypeXls, IconLayoutDashboard } from '@tabler/icons-react';

const data = {
    user: {
        name: 'shadcn',
        email: 'm@example.com',
        avatar: '/avatars/shadcn.jpg',
    },
    navMain: [
        {
            title: 'Dashboard',
            url: '/dashboard',
            icon: IconLayoutDashboard,
        },
        {
            title: 'Leads',
            url: '/leads',
            icon: IconFileTypeXls,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar
            collapsible="offcanvas"
            {...props}
            className="sticky top-0 backdrop-blur-sm z-50"
        >
            <SidebarHeader className="mb-6">
                <Link href="/dashboard" className="text-center">
                    <span className="text-2xl font-semibold font-bespoke-sans">
                        Coconut Pesticides
                    </span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
        </Sidebar>
    );
}
