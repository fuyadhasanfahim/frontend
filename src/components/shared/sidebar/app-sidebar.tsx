'use client';

import * as React from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { NavMain } from './nav-main';
import Link from 'next/link';
import Image from 'next/image';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <Link href="/dashboard" className="mx-auto">
                    <Image
                        src={process.env.NEXT_PUBLIC_BRAND_LOGO!}
                        alt="logo"
                        width={125}
                        height={40}
                        style={{
                            width: 'auto',
                            height: 'auto',
                        }}
                        priority
                    />
                </Link>
            </SidebarHeader>
            <SidebarContent className="mt-4">
                <NavMain />
            </SidebarContent>
        </Sidebar>
    );
}
