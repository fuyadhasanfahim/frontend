'use client';

import React, { useState } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { toast } from 'sonner';
import { useUpdateUserMutation } from '@/redux/features/user/userApi';
import { Spinner } from '@/components/ui/spinner';

const platforms = [
    {
        platform: 'Facebook',
        url: 'https://facebook.com/',
        icon: 'IconBrandFacebook',
        color: 'bg-[#1877F2] text-white',
    },
    {
        platform: 'Instagram',
        url: 'https://instagram.com/',
        icon: 'IconBrandInstagram',
        color: 'bg-[#E1306C] text-white',
    },
    {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/',
        icon: 'IconBrandLinkedin',
        color: 'bg-[#0A66C2] text-white',
    },
    {
        platform: 'X',
        url: 'https://x.com/',
        icon: 'IconBrandX',
        color: 'bg-black text-white',
    },
];

type SocialLink = {
    platform: string;
    username: string;
    url: string;
    icon: string;
    color: string;
};

export default function SocialProfileCard({
    socialLinks,
    handleClick,
}: {
    socialLinks?: SocialLink[];
    handleClick: (
        e: React.MouseEvent<HTMLButtonElement>,
        name: string,
        value: string
    ) => void;
}) {
    const [links, setLinks] = useState<SocialLink[]>(
        socialLinks && socialLinks.length > 0
            ? socialLinks
            : [{ platform: '', username: '', url: '', icon: '', color: '' }]
    );

    const [initialLinks] = useState<SocialLink[]>(links);

    const hasChanges = JSON.stringify(links) !== JSON.stringify(initialLinks);

    const handleAdd = () => {
        if (links.length >= 4) {
            toast.warning('You can only add up to 4 social profiles.');
            return;
        }
        setLinks([
            ...links,
            { platform: '', username: '', url: '', icon: '', color: '' },
        ]);
    };

    const handleDelete = (index: number) => {
        setLinks(links.filter((_, i) => i !== index));
    };

    const handleChange = (
        index: number,
        field: keyof SocialLink,
        value: string
    ) => {
        if (field === 'platform') {
            const alreadyExists = links.some(
                (l, i) => i !== index && l.platform === value
            );

            if (alreadyExists) {
                toast.warning(
                    `${value} is already selected. Please choose another platform.`
                );
                return;
            }
        }

        const newLinks: SocialLink[] = [...links];
        newLinks[index] = {
            ...newLinks[index],
            [field]: value,
        };
        setLinks(newLinks);
    };

    const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

    const handleSave = async () => {
        const formatted = links
            .filter((l) => l.platform && l.username)
            .map((l) => {
                const p = platforms.find((p) => p.platform === l.platform);
                return {
                    platform: l.platform,
                    username: l.username,
                    url: (p?.url || '') + l.username,
                    icon: p?.icon || '',
                    color: p?.color || '',
                };
            });

        try {
            const res = await updateUser({ socialLinks: formatted }).unwrap();

            if (!res.success) {
                toast.error('Error saving social links');
                return;
            }
            toast.success('Social links saved successfully');
        } catch (error) {
            console.error(error);
            toast.error('Error saving social links');
        }
    };

    return (
        <form className="col-span-3" onSubmit={handleSave}>
            <Card>
                <CardHeader>
                    <CardTitle>Social Profile</CardTitle>
                    <CardDescription>
                        Add links to your social media profiles (max 4).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        {links.map((link, index) => (
                            <div key={index} className="flex items-end gap-4">
                                <div className="grid gap-3 w-full max-w-44">
                                    <Label>Platform</Label>
                                    <Select
                                        value={link.platform}
                                        onValueChange={(val) =>
                                            handleChange(index, 'platform', val)
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select platform" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {platforms.map((p) => (
                                                <SelectItem
                                                    key={p.platform}
                                                    value={p.platform}
                                                >
                                                    {p.platform}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-3 w-full max-w-72">
                                    <Label>Username</Label>
                                    <Input
                                        placeholder="your username"
                                        value={link.username}
                                        onChange={(e) =>
                                            handleChange(
                                                index,
                                                'username',
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex flex-col">
                                    {index === 0 ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleAdd}
                                            className="mt-5"
                                        >
                                            <IconPlus /> Add More
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={() => handleDelete(index)}
                                            className="mt-5"
                                        >
                                            <IconTrash /> Delete
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className='flex items-center gap-4'>
                    <Button type="submit" disabled={!hasChanges || isUpdating}>
                        {isUpdating ? <Spinner /> : 'Save'}
                    </Button>
                    <Button
                        type="button"
                        variant={'secondary'}
                        onClick={(e) =>
                            handleClick(e, 'social-profile', 'false')
                        }
                    >
                        Cancel
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
