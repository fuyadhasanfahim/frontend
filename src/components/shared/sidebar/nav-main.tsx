'use client';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { data } from '@/data/sidebar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavMain() {
    const pathname = usePathname();

    return (
        <SidebarGroup className="px-4">
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu className="space-y-1">
                    {data.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                tooltip={item.title}
                                className={cn(
                                    pathname.startsWith(item.url) &&
                                        'bg-primary text-white shadow-xl font-medium',
                                    'h-10 rounded-[8px] py-2 px-4 hover:bg-primary/10 hover:text-primary transition-all duration-200 ease-initial hover:shadow-none'
                                )}
                                asChild
                            >
                                <Link href={item.url}>
                                    {item.icon && <item.icon strokeWidth={2} />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
