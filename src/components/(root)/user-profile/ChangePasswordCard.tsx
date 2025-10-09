'use client';

import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdatePasswordMutation } from '@/redux/features/user/userApi';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

export default function ChangePasswordCard({
    handleClick,
}: {
    handleClick: (
        e: React.MouseEvent<HTMLButtonElement>,
        name: string,
        value: string
    ) => void;
}) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [updatePassword, { isLoading: isUpdatingPassword }] =
        useUpdatePasswordMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isUpdatingPassword) return;
        try {
            await updatePassword({ oldPassword, newPassword }).unwrap();

            toast.success('Password updated successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update password. Please try again.');
        }
    };

    const rules = [
        {
            label: 'At least 6 characters',
            test: (pw: string) => pw.length >= 6,
        },
        {
            label: 'At least one uppercase letter',
            test: (pw: string) => /[A-Z]/.test(pw),
        },
        {
            label: 'At least one lowercase letter',
            test: (pw: string) => /[a-z]/.test(pw),
        },
        { label: 'At least one number', test: (pw: string) => /\d/.test(pw) },
        {
            label: 'At least one special character (@$!%*?&)',
            test: (pw: string) => /[@$!%*?&]/.test(pw),
        },
    ];

    const isFormValid =
        oldPassword &&
        newPassword &&
        confirmPassword &&
        newPassword === confirmPassword &&
        rules.every((rule) => rule.test(newPassword));

    return (
        <form className="col-span-3" onSubmit={handleSubmit}>
            <Card className="shadow-md border border-muted">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                        Change Password
                    </CardTitle>
                    <CardDescription>
                        Ensure your account is using a strong, unique password.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <PasswordField
                        label="Old Password"
                        value={oldPassword}
                        onChange={setOldPassword}
                        show={showOldPassword}
                        setShow={setShowOldPassword}
                    />

                    <div className="space-y-2">
                        <PasswordField
                            label="New Password"
                            value={newPassword}
                            onChange={setNewPassword}
                            show={showNewPassword}
                            setShow={setShowNewPassword}
                        />

                        {newPassword && (
                            <div className="mt-2 space-y-1 text-sm rounded-md bg-muted/30 p-3 border">
                                {rules.map((rule, idx) => {
                                    const passed = rule.test(newPassword);
                                    return (
                                        <div
                                            key={idx}
                                            className={cn(
                                                'flex items-center gap-2 transition-colors',
                                                passed
                                                    ? 'text-green-600'
                                                    : 'text-gray-500'
                                            )}
                                        >
                                            {passed ? (
                                                <Check size={16} />
                                            ) : (
                                                <X size={16} />
                                            )}
                                            <span>{rule.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <PasswordField
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            show={showConfirmPassword}
                            setShow={setShowConfirmPassword}
                        />
                        {confirmPassword && confirmPassword !== newPassword && (
                            <p className="text-sm text-red-500">
                                Passwords do not match.
                            </p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex items-center gap-4">
                    <Button
                        type="submit"
                        disabled={!isFormValid || isUpdatingPassword}
                    >
                        {isUpdatingPassword ? <Spinner /> : 'Update Password'}
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

const PasswordField = ({
    label,
    value,
    onChange,
    show,
    setShow,
    placeholder = '••••••••',
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    show: boolean;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
    placeholder?: string;
}) => (
    <div className="grid gap-2">
        <Label className="font-medium text-sm">{label}</Label>
        <div className="relative">
            <Input
                type={show ? 'text' : 'password'}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="pr-10"
            />
            <Button
                type="button"
                size={'icon'}
                variant="ghost"
                onClick={() => setShow((prev) => !prev)}
                className="absolute right-0 top-1/2 -translate-y-1/2"
            >
                {show ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </Button>
        </div>
    </div>
);
