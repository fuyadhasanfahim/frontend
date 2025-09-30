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

    const onSubmit = (values: SignUpFormValues) => {
        console.log('✅ Submitted values:', values);
    };

    // password rules
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
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setPassword(e.target.value);
                                                }}
                                            />
                                        </FormControl>
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
                                                                    size={16}
                                                                />
                                                            ) : (
                                                                <X size={16} />
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
                                )}
                            />
                        </CardContent>

                        <CardFooter className="flex flex-col gap-3">
                            <Button type="submit" className="w-full">
                                Sign Up
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
