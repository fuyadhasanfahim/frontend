'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateUserMutation } from '@/redux/features/user/userApi';
import { IUser } from '@/types/user.interface';
import React, { useState } from 'react';
import { toast } from 'sonner';

export default function EditProfileCard({
    user,
    handleClick,
}: {
    user: IUser;
    handleClick: (
        e: React.MouseEvent<HTMLButtonElement>,
        name: string,
        value: string
    ) => void;
}) {
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [address, setAddress] = useState(user?.address || '');
    const [country, setCountry] = useState(user?.country || '');
    const [bio, setBio] = useState(user?.bio || '');

    const [updateUser, { isLoading }] = useUpdateUserMutation();

    const isDirty =
        firstName !== (user?.firstName || '') ||
        lastName !== (user?.lastName || '') ||
        email !== (user?.email || '') ||
        phone !== (user?.phone || '') ||
        address !== (user?.address || '') ||
        country !== (user?.country || '') ||
        bio !== (user?.bio || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            firstName,
            lastName,
            email,
            phone,
            address,
            country,
            bio,
        };

        try {
            await updateUser(data).unwrap();
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile. Please try again.');
        }
    };

    return (
        <form className="col-span-3" onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>
                        Set your personal information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 items-center gap-4">
                        <div className="grid gap-3">
                            <Label className="font-semibold">First Name</Label>
                            <Input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label className="font-semibold">Last Name</Label>
                            <Input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label className="font-semibold">Email</Label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label className="font-semibold">
                                Phone Number
                            </Label>
                            <Input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label className="font-semibold">Address</Label>
                            <Input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label className="font-semibold">Country</Label>
                            <Input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-3 col-span-2">
                            <Label className="font-semibold">Bio</Label>
                            <Textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={!isDirty || isLoading}>
                            {isLoading ? <Spinner /> : 'Save Changes'}
                        </Button>
                        <Button
                            type="button"
                            variant={'secondary'}
                            onClick={(e) =>
                                handleClick(e, 'edit-profile', 'false')
                            }
                        >
                            Cancel
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </form>
    );
}
