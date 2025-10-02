'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useSignedUser } from '@/hooks/useSignedUser';
import { useSignoutMutation } from '@/redux/features/auth/authApi';
import {
    BellIcon,
    EllipsisVerticalIcon,
    LogOutIcon,
    UserCircleIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function NavUser() {
    const { user } = useSignedUser();

    const [signout] = useSignoutMutation();
    const router = useRouter();

    const handleSignout = async () => {
        try {
            await signout().unwrap();

            router.push('/sign-in');
            toast.success('Signed out successfully.');
        } catch (error) {
            toast.error((error as Error).message || 'Something went wrong.');
        }
    };

    return (
        <SidebarMenu className="w-56">
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="!rounded-full cursor-pointer !outline-none"
                        >
                            <Avatar className="h-10 w-10 rounded-full">
                                <AvatarImage
                                    src={user?.image}
                                    alt={user?.firstName}
                                />
                                <AvatarFallback className="rounded-lg">
                                    {user?.firstName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">
                                    {user?.firstName} {user?.lastName}
                                </span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {user?.email}
                                </span>
                            </div>
                            <EllipsisVerticalIcon />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-full max-w-56"
                        align="end"
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                asChild
                                className="cursor-pointer"
                            >
                                <Link href={'/user-profile'}>
                                    <UserCircleIcon />
                                    User Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                asChild
                                className="cursor-pointer"
                            >
                                <Link href={'/user-profile/notifications'}>
                                    <BellIcon />
                                    Notifications
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuItem
                            variant="destructive"
                            className="hover:bg-red-100 transition-colors duration-200 ease-in cursor-pointer"
                            onClick={handleSignout}
                        >
                            <LogOutIcon />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
