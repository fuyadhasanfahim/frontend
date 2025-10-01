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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpFormValues, signupSchema } from '@/validators/auth.schema';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { useSignupMutation } from '@/redux/features/auth/authApi';
import { toast } from 'sonner';
import { IconEye, IconEyeOff, IconLoader2 } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function SignUpForm() {
    const [password, setPassword] = useState('');

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
        },
    });

    const [signup, { isLoading }] = useSignupMutation();
    const isDisabled = isLoading || form.formState.isSubmitting;

    const router = useRouter();

    const onSubmit = async (values: SignUpFormValues) => {
        try {
            const resPromise = signup(values).unwrap();

            await toast.promise(resPromise, {
                loading: 'Creating your account...',
                success: (data) => {
                    router.push('/sign-in');
                    return data?.message ?? '🎉 Account created successfully!';
                },
                error: (err) => {
                    return (
                        err?.data?.message ??
                        '⚠️ Something went wrong while creating your account.'
                    );
                },
            });
        } catch (err) {
            console.error(err);
            toast.error('Unexpected error. Please try again later.');
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

    return (
        <div className="w-full max-w-lg mx-auto">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Create an Account</CardTitle>
                            <CardDescription>
                                Fill in the form below to get started.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 items-start gap-6">
                                {/* First Name */}
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="John"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Last Name */}
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Doe"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="you@example.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Phone */}
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="tel"
                                                placeholder="+8801XXXXXXXXX"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password with conditional checklist */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => {
                                    const [showPassword, setShowPassword] =
                                        useState(false);

                                    return (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <div className="relative">
                                                <FormControl>
                                                    <Input
                                                        type={
                                                            showPassword
                                                                ? 'text'
                                                                : 'password'
                                                        }
                                                        placeholder="••••••••"
                                                        {...field}
                                                        onChange={(e) => {
                                                            field.onChange(e);
                                                            setPassword(
                                                                e.target.value
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                {/* Toggle button */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            (prev) => !prev
                                                        )
                                                    }
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPassword ? (
                                                        <IconEyeOff
                                                            stroke={2}
                                                            size={18}
                                                        />
                                                    ) : (
                                                        <IconEye
                                                            stroke={2}
                                                            size={18}
                                                        />
                                                    )}
                                                </button>
                                            </div>
                                            <FormMessage />

                                            {/* Checklist only if user typed something */}
                                            {password && (
                                                <div className="mt-2 space-y-1 text-sm">
                                                    {rules.map((rule, idx) => {
                                                        const passed =
                                                            rule.test(password);
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`flex items-center gap-2 ${
                                                                    passed
                                                                        ? 'text-green-600'
                                                                        : 'text-gray-500'
                                                                }`}
                                                            >
                                                                {passed ? (
                                                                    <Check
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <X
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                )}
                                                                <span>
                                                                    {rule.label}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </FormItem>
                                    );
                                }}
                            />
                        </CardContent>

                        <CardFooter className="flex flex-col gap-3">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isDisabled}
                            >
                                {isDisabled ? (
                                    <IconLoader2 stroke={2} />
                                ) : (
                                    'Sign Up'
                                )}
                            </Button>
                            <p className="text-sm text-center text-gray-600">
                                Already have an account?{' '}
                                <Link
                                    href="/sign-in"
                                    className="font-medium text-primary hover:underline"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </form>
            </Form>
        </div>
    );
}
