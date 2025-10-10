'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
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
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { CountrySelect } from './CountrySelect';
import { Textarea } from '@/components/ui/textarea';
import { useNewLeadMutation } from '@/redux/features/lead/leadApi';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

const leadSchema = z.object({
    companyName: z.string().min(1, 'Company name is required'),
    websiteUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    emails: z.array(z.string().email('Invalid email')),
    phones: z.array(z.string().min(7, 'Phone must be at least 7 digits')),
    address: z.string().optional(),
    contactPerson: z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
    }),
    designation: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function LeadForm() {
    const form = useForm<LeadFormValues>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            companyName: '',
            websiteUrl: '',
            emails: [''],
            phones: [''],
            address: '',
            contactPerson: { firstName: '', lastName: '' },
            designation: '',
            country: '',
            notes: '',
        },
    });

    const [newLead, { isLoading }] = useNewLeadMutation();

    const onSubmit = async (values: LeadFormValues) => {
        try {
            const res = await newLead(values).unwrap();

            if (res.success) {
                toast.success('Lead created successfully!');
                form.reset();
            }
        } catch (error) {
            toast.error((error as Error).message);
        }
    };

    const emails = form.watch('emails');
    const setEmails = (next: string[]) => form.setValue('emails', next);

    const phones = form.watch('phones');
    const setPhones = (next: string[]) => form.setValue('phones', next);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="max-w-4xl mx-auto mt-6"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Lead</CardTitle>
                        <CardDescription>
                            Fill in the details below to create a new lead
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label>
                                    Company Name{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    placeholder="Enter company name"
                                    {...form.register('companyName')}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Website URL (optional)</Label>
                                <Input
                                    placeholder="https://example.com"
                                    {...form.register('websiteUrl')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label>
                                    First Name{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    placeholder="Enter first name"
                                    {...form.register(
                                        'contactPerson.firstName'
                                    )}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>
                                    Last Name{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    placeholder="Enter last name"
                                    {...form.register('contactPerson.lastName')}
                                />
                            </div>

                            <div className="grid gap-2 col-span-2">
                                <Label>Designation (optional)</Label>
                                <Input
                                    placeholder="Enter designation"
                                    {...form.register('designation')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label>
                                    Email(s){' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                {emails.map((_, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2"
                                    >
                                        <Input
                                            placeholder="email@example.com"
                                            {...form.register(
                                                `emails.${index}`
                                            )}
                                        />
                                        {index === 0 ? (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    setEmails([...emails, ''])
                                                }
                                            >
                                                <IconPlus className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="destructive"
                                                onClick={() =>
                                                    setEmails(
                                                        emails.filter(
                                                            (_, i) =>
                                                                i !== index
                                                        )
                                                    )
                                                }
                                            >
                                                <IconTrash className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="grid gap-2">
                                <Label>
                                    Phone Number(s){' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                {phones.map((_, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2"
                                    >
                                        <Input
                                            placeholder="01xxxxxxxxx"
                                            {...form.register(
                                                `phones.${index}`
                                            )}
                                        />
                                        {index === 0 ? (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    setPhones([...phones, ''])
                                                }
                                            >
                                                <IconPlus className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="destructive"
                                                onClick={() =>
                                                    setPhones(
                                                        phones.filter(
                                                            (_, i) =>
                                                                i !== index
                                                        )
                                                    )
                                                }
                                            >
                                                <IconTrash className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label>Address (optional)</Label>
                                <Input
                                    placeholder="Enter address"
                                    {...form.register('address')}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>
                                    Country{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <CountrySelect
                                    className="w-full"
                                    value={form.watch('country')}
                                    onChange={(val) =>
                                        form.setValue('country', val)
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Notes (optional)</Label>
                            <Textarea
                                placeholder="Additional notes..."
                                {...form.register('notes')}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex items-center gap-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Spinner /> : 'Submit'}
                        </Button>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
