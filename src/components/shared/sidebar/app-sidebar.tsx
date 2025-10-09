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
import Image from 'next/image';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar
            collapsible="offcanvas"
            {...props}
            className="sticky top-0 backdrop-blur-sm z-50"
        >
            <SidebarHeader>
                <Link href="/dashboard" className="mx-auto">
                    <Image
                        src="https://res.cloudinary.com/dny7zfbg9/image/upload/v1759400371/shmce8gonodjco6oq74k.png"
                        alt="logo"
                        width={140}
                        height={40}
                        priority
                    />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMain />
            </SidebarContent>
        </Sidebar>
    );
}
