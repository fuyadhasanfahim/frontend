'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useSignedUser } from '@/hooks/useSignedUser';
import {
    IconBrandFacebook,
    IconBrandInstagram,
    IconBrandLinkedin,
    IconBrandX,
    IconEdit,
    IconLock,
    IconUser,
} from '@tabler/icons-react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import EditProfileCard from './EditProfileCard';
import { IUser } from '@/types/user.interface';
import ChangePasswordCard from './ChangePasswordCard';
import SocialProfileCard from './SocialProfileCard';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const iconMap: Record<string, React.ElementType> = {
    IconBrandFacebook,
    IconBrandInstagram,
    IconBrandLinkedin,
    IconBrandX,
};

export default function RootUserProfilePage() {
    const { user, isLoading, error } = useSignedUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const editProfile = searchParams.get('edit-profile') === 'true';
    const changePassword = searchParams.get('change-password') === 'true';
    const socialProfile = searchParams.get('social-profile') === 'true';

    const createQueryString = (name: string, value: string) => {
        const params = new URLSearchParams();
        params.set(name, value);
        return params.toString();
    };

    const handleClick = (
        e: React.MouseEvent<HTMLButtonElement>,
        name: string,
        value: string
    ) => {
        e.preventDefault();

        if (searchParams.get(name) === value) {
            return;
        }

        const queryString = createQueryString(name, value);
        router.push(pathname + '?' + queryString);
    };

    // 🔹 Loading state with Skeletons
    if (isLoading) {
        return (
            <div className="grid grid-cols-5 items-start gap-6">
                <Card className="col-span-2 flex flex-col items-center p-6">
                    <Skeleton className="h-36 w-36 rounded-full mb-4" />
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-28 mb-2" />
                    <div className="flex gap-2 mt-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </Card>
                <Card className="col-span-3 p-6">
                    <Skeleton className="h-6 w-40 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2 mb-1" />
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="max-w-lg mx-auto p-6 text-center">
                <CardHeader>
                    <CardTitle className="text-red-500">
                        Failed to load profile
                    </CardTitle>
                    <CardDescription>
                        Something went wrong while fetching your data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.refresh()}>Retry</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-5 items-start gap-6">
            <Card className="col-span-2">
                <CardHeader className="flex flex-col items-center">
                    <figure>
                        <Image
                            src={user?.image || ''}
                            alt={`${user?.firstName} ${user?.lastName} Profile Picture`}
                            width={150}
                            height={150}
                            className="rounded-full ring-2 ring-offset-2 ring-primary"
                        />
                    </figure>
                    <h2 className="text-2xl font-bold mt-4">
                        {user?.firstName + ' ' + user?.lastName}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {user?.designation}
                    </p>

                    {user?.socialLinks && (
                        <div className="flex items-center gap-2 mt-2">
                            {user.socialLinks.map(
                                ({ url, platform, color, icon }) => {
                                    const Icon = iconMap[icon];
                                    return (
                                        <Link
                                            key={platform}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button
                                                size={'icon'}
                                                variant={'link'}
                                                className={cn(
                                                    'rounded-full p-2 hover:scale-110 transition-transform',
                                                    color
                                                )}
                                            >
                                                {Icon && (
                                                    <Icon className="h-5 w-5" />
                                                )}
                                            </Button>
                                        </Link>
                                    );
                                }
                            )}
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col items-start gap-2 bg-purple-100 rounded-lg p-2">
                        <Button
                            variant={'link'}
                            onClick={(e) =>
                                handleClick(e, 'edit-profile', 'true')
                            }
                        >
                            <IconEdit />
                            Edit Profile
                        </Button>
                        <Separator className="bg-primary" />
                        <Button
                            variant={'link'}
                            onClick={(e) =>
                                handleClick(e, 'change-password', 'true')
                            }
                        >
                            <IconLock />
                            Change Password
                        </Button>
                        <Separator className="bg-primary" />
                        <Button
                            variant={'link'}
                            onClick={(e) =>
                                handleClick(e, 'social-profile', 'true')
                            }
                        >
                            <IconUser />
                            Social Profile
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {editProfile ? (
                <EditProfileCard
                    user={user as IUser}
                    handleClick={handleClick}
                />
            ) : changePassword ? (
                <ChangePasswordCard handleClick={handleClick} />
            ) : socialProfile ? (
                <SocialProfileCard
                    socialLinks={user?.socialLinks}
                    handleClick={handleClick}
                />
            ) : (
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>User information</CardTitle>
                        <CardDescription>
                            This information is private and will not be shared
                            with anyone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 items-center gap-4">
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold">Full Name</h3>
                                <p className="text-sm text-muted-foreground">
                                    {user?.firstName + ' ' + user?.lastName}
                                </p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold">Email</h3>
                                <p className="text-sm text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold">Phone Number</h3>
                                <p className="text-sm text-muted-foreground">
                                    {user?.phone}
                                </p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold">Address</h3>
                                <p className="text-sm text-muted-foreground">
                                    {user?.address}
                                </p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold">Country</h3>
                                <p className="text-sm text-muted-foreground">
                                    {user?.country}
                                </p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3 className="font-semibold">Bio</h3>
                                <p className="text-sm text-muted-foreground">
                                    {user?.bio}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
