'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { useNewLeadMutation } from '@/redux/features/lead/leadApi';
import { z } from 'zod';
import { CountrySelect } from '@/components/shared/CountrySelect';

const leadSchema = z.object({
    company: z.object({
        name: z.string().min(1, 'Company name is required'),
        website: z.url('Invalid URL').optional().or(z.literal('')),
        emails: z
            .array(z.email('Invalid email'))
            .min(1, 'At least one email is required'),
        phones: z
            .array(z.string().min(7, 'Phone must be at least 7 digits'))
            .min(1, 'At least one phone number is required'),
    }),

    contactPersons: z
        .array(
            z.object({
                firstName: z.string().min(1, 'First name is required'),
                lastName: z.string().optional(),
                designation: z.string().optional(),
                emails: z
                    .array(z.email('Invalid email'))
                    .min(1, 'At least one email required'),
                phones: z
                    .array(z.string().min(7, 'Phone must be at least 7 digits'))
                    .min(1, 'At least one phone required'),
            })
        )
        .min(1, 'At least one contact person is required'),

    address: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function LeadForm() {
    const form = useForm<LeadFormValues>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            company: {
                name: '',
                website: '',
                emails: [''],
                phones: [''],
            },
            contactPersons: [
                {
                    firstName: '',
                    lastName: '',
                    designation: '',
                    emails: [''],
                    phones: [''],
                },
            ],
            address: '',
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

    const companyEmails = form.watch('company.emails');
    const setCompanyEmails = (next: string[]) =>
        form.setValue('company.emails', next);

    const companyPhones = form.watch('company.phones');
    const setCompanyPhones = (next: string[]) =>
        form.setValue('company.phones', next);

    const contact = form.watch('contactPersons')[0];
    const setContactEmails = (next: string[]) =>
        form.setValue('contactPersons.0.emails', next);
    const setContactPhones = (next: string[]) =>
        form.setValue('contactPersons.0.phones', next);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="max-w-4xl mx-auto mt-6"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Lead</CardTitle>
                        <CardDescription></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Company Info */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label>Company Name *</Label>
                                <Input
                                    {...form.register('company.name')}
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Website</Label>
                                <Input
                                    {...form.register('company.website')}
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>

                        {/* Company Contacts */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label>Email(s) *</Label>
                                {companyEmails.map((_, i) => (
                                    <div key={i} className="flex gap-2 mt-1">
                                        <Input
                                            {...form.register(
                                                `company.emails.${i}`
                                            )}
                                            placeholder="email@example.com"
                                        />
                                        {i === 0 ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    setCompanyEmails([
                                                        ...companyEmails,
                                                        '',
                                                    ])
                                                }
                                            >
                                                <IconPlus className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() =>
                                                    setCompanyEmails(
                                                        companyEmails.filter(
                                                            (_, idx) =>
                                                                idx !== i
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

                            <div className="space-y-3">
                                <Label>Phone(s) *</Label>
                                {companyPhones.map((_, i) => (
                                    <div key={i} className="flex gap-2 mt-1">
                                        <Input
                                            {...form.register(
                                                `company.phones.${i}`
                                            )}
                                            placeholder="01xxxxxxxxx"
                                        />
                                        {i === 0 ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    setCompanyPhones([
                                                        ...companyPhones,
                                                        '',
                                                    ])
                                                }
                                            >
                                                <IconPlus className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() =>
                                                    setCompanyPhones(
                                                        companyPhones.filter(
                                                            (_, idx) =>
                                                                idx !== i
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

                        {/* Contact Person */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label>First Name *</Label>
                                <Input
                                    {...form.register(
                                        'contactPersons.0.firstName'
                                    )}
                                    placeholder="First name"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Last Name</Label>
                                <Input
                                    {...form.register(
                                        'contactPersons.0.lastName'
                                    )}
                                    placeholder="Last name"
                                />
                            </div>

                            <div className="space-y-3 col-span-2">
                                <Label>Designation</Label>
                                <Input
                                    {...form.register(
                                        'contactPersons.0.designation'
                                    )}
                                    placeholder="Designation"
                                />
                            </div>
                        </div>

                        {/* Contact Person Details */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label>Contact Email(s)</Label>
                                {contact.emails.map((_, i) => (
                                    <div key={i} className="flex gap-2 mt-1">
                                        <Input
                                            {...form.register(
                                                `contactPersons.0.emails.${i}`
                                            )}
                                            placeholder="email@example.com"
                                        />
                                        {i === 0 ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    setContactEmails([
                                                        ...contact.emails,
                                                        '',
                                                    ])
                                                }
                                            >
                                                <IconPlus className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() =>
                                                    setContactEmails(
                                                        contact.emails.filter(
                                                            (_, idx) =>
                                                                idx !== i
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

                            <div className="space-y-3">
                                <Label>Contact Phone(s)</Label>
                                {contact.phones.map((_, i) => (
                                    <div key={i} className="flex gap-2 mt-1">
                                        <Input
                                            {...form.register(
                                                `contactPersons.0.phones.${i}`
                                            )}
                                            placeholder="01xxxxxxxxx"
                                        />
                                        {i === 0 ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    setContactPhones([
                                                        ...contact.phones,
                                                        '',
                                                    ])
                                                }
                                            >
                                                <IconPlus className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() =>
                                                    setContactPhones(
                                                        contact.phones.filter(
                                                            (_, idx) =>
                                                                idx !== i
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

                        {/* Other Info */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label>Address</Label>
                                <Input
                                    {...form.register('address')}
                                    placeholder="Enter address"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label>Country *</Label>
                                <CountrySelect
                                    value={form.watch('country')}
                                    onChange={(val) =>
                                        form.setValue('country', val)
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Notes</Label>
                            <Textarea
                                {...form.register('notes')}
                                placeholder="Additional notes..."
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex gap-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Spinner /> : 'Submit'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                        >
                            Cancel
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
