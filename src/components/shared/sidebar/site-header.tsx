'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { NavUser } from './nav-user';
import { BellIcon, Check, CheckCheck, DotIcon, SearchIcon } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export function SiteHeader() {
    const pathname = usePathname();

    const data = [
        {
            location: '/dashboard',
            title: 'Dashboard',
        },
        {
            location: '/leads',
            title: 'Leads',
        },
    ];

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center px-4 justify-between">
                <div className="flex w-full items-center">
                    <SidebarTrigger />
                    <Separator
                        orientation="vertical"
                        className="mx-2 data-[orientation=vertical]:h-4"
                    />
                    <h1 className="text-base font-medium">
                        {
                            data.find((d) => pathname.startsWith(d.location))
                                ?.title
                        }
                    </h1>
                </div>

                <div className="items-end">
                    <div className="flex items-center gap-4 w-full">
                        <Button
                            variant={'outline'}
                            size={'icon'}
                            className="!rounded-full"
                        >
                            <SearchIcon />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant={'outline'}
                                    size={'icon'}
                                    className="!rounded-full relative"
                                >
                                    <DotIcon
                                        className="absolute -top-1 left-1 !w-9 !h-9 text-destructive animate-caret-blink"
                                        strokeWidth={3}
                                    />
                                    <BellIcon />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-full max-w-xs"
                                align="end"
                            >
                                <DropdownMenuLabel className="flex items-center justify-between">
                                    <span className="text-[16px]">
                                        Notifications
                                    </span>
                                    <Button
                                        size={'sm'}
                                        variant={'ghost'}
                                        className="!text-[12px]"
                                    >
                                        <CheckCheck size={20} />
                                        Mark all as Read
                                    </Button>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <div>
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-[14px] font-medium text-clip">
                                                Message title
                                            </h3>
                                            <Button
                                                size={'sm'}
                                                variant={'ghost'}
                                                className="!text-[12px]"
                                            >
                                                <Check size={20} />
                                                Mark all as Read
                                            </Button>
                                        </div>
                                        <p className="text-ellipsis max-w-xs">
                                            Lorem ipsum dolor sit amet
                                            consectetur adipisicing elit.
                                            Obcaecati odit natus earum odio
                                            labore explicabo.
                                        </p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <NavUser />
                    </div>
                </div>
            </div>
        </header>
    );
}
