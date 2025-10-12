'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { CountrySelect } from '../../../shared/CountrySelect';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import {
    useGetLeadByIdQuery,
    useUpdateLeadMutation,
} from '@/redux/features/lead/leadApi';
import { useParams, useRouter } from 'next/navigation';
import { IContactPerson } from '@/types/lead.interface';

const leadSchema = z.object({
    company: z.object({
        name: z.string().min(1, 'Company name is required'),
        website: z.string().url('Invalid URL').optional().or(z.literal('')),
        emails: z
            .array(z.string().email('Invalid email'))
            .min(1, 'At least one email required'),
        phones: z
            .array(z.string().min(7, 'Phone must be at least 7 digits'))
            .min(1, 'At least one phone required'),
    }),
    contactPersons: z
        .array(
            z.object({
                firstName: z.string().min(1, 'First name is required'),
                lastName: z.string().optional(),
                designation: z.string().optional(),
                emails: z
                    .array(z.string().email('Invalid email'))
                    .min(1, 'At least one email required'),
                phones: z
                    .array(z.string().min(7, 'Phone must be at least 7 digits'))
                    .min(1, 'At least one phone required'),
            })
        )
        .min(1, 'At least one contact person required'),
    address: z.string().optional(),
    country: z.string().min(1, 'Country is required'),
    notes: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function RootLeadsEditPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const {
        data,
        isLoading: loadingLead,
        isError,
    } = useGetLeadByIdQuery(id, {
        skip: !id,
    });
    const [updateLead, { isLoading: updating }] = useUpdateLeadMutation();

    const form = useForm<LeadFormValues>({
        resolver: zodResolver(leadSchema),
        defaultValues: {
            company: { name: '', website: '', emails: [''], phones: [''] },
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

    // Pre-fill form when data loads
    useEffect(() => {
        if (data?.lead) {
            const lead = data.lead;
            form.reset({
                company: {
                    name: lead.company?.name || '',
                    website: lead.company?.website || '',
                    emails: lead.company?.emails?.length
                        ? lead.company.emails
                        : [''],
                    phones: lead.company?.phones?.length
                        ? lead.company.phones
                        : [''],
                },
                contactPersons:
                    lead.contactPersons?.length > 0
                        ? lead.contactPersons.map((cp: IContactPerson) => ({
                              firstName: cp.firstName,
                              lastName: cp.lastName || '',
                              designation: cp.designation || '',
                              emails: cp.emails?.length ? cp.emails : [''],
                              phones: cp.phones?.length ? cp.phones : [''],
                          }))
                        : [
                              {
                                  firstName: '',
                                  lastName: '',
                                  designation: '',
                                  emails: [''],
                                  phones: [''],
                              },
                          ],
                address: lead.address || '',
                country: lead.country || '',
                notes: lead.notes || '',
            });
        }
    }, [data, form]);

    const onSubmit = async (values: LeadFormValues) => {
        try {
            const res = await updateLead({ id, body: { ...values } }).unwrap();
            if (res.success) {
                toast.success('Lead updated successfully!');
                router.push('/leads');
            }
        } catch (err) {
            toast.error((err as Error).message || 'Failed to update lead.');
        }
    };

    // Watchers for dynamic inputs
    const companyEmails = form.watch('company.emails');
    const companyPhones = form.watch('company.phones');
    const contact = form.watch('contactPersons')[0];

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="max-w-4xl w-full mx-auto mt-6"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Lead</CardTitle>
                        <CardDescription>
                            Update the lead information below.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Loading skeleton */}
                        {loadingLead ? (
                            <div className="space-y-4">
                                <Spinner />
                            </div>
                        ) : isError ? (
                            <p className="text-red-500">
                                Failed to load lead data.
                            </p>
                        ) : (
                            <>
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
                                            {...form.register(
                                                'company.website'
                                            )}
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                </div>

                                {/* Emails / Phones */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label>Email(s) *</Label>
                                        {companyEmails?.map((_, i) => (
                                            <div
                                                key={i}
                                                className="flex gap-2 mt-1"
                                            >
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
                                                            form.setValue(
                                                                'company.emails',
                                                                [
                                                                    ...companyEmails,
                                                                    '',
                                                                ]
                                                            )
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
                                                            form.setValue(
                                                                'company.emails',
                                                                companyEmails.filter(
                                                                    (_, idx) =>
                                                                        idx !==
                                                                        i
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
                                        {companyPhones?.map((_, i) => (
                                            <div
                                                key={i}
                                                className="flex gap-2 mt-1"
                                            >
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
                                                            form.setValue(
                                                                'company.phones',
                                                                [
                                                                    ...companyPhones,
                                                                    '',
                                                                ]
                                                            )
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
                                                            form.setValue(
                                                                'company.phones',
                                                                companyPhones.filter(
                                                                    (_, idx) =>
                                                                        idx !==
                                                                        i
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

                                {/* Contact Info */}
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

                                {/* Contact Details */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label>Contact Email(s)</Label>
                                        {contact.emails?.map((_, i) => (
                                            <div
                                                key={i}
                                                className="flex gap-2 mt-1"
                                            >
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
                                                            form.setValue(
                                                                'contactPersons.0.emails',
                                                                [
                                                                    ...contact.emails,
                                                                    '',
                                                                ]
                                                            )
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
                                                            form.setValue(
                                                                'contactPersons.0.emails',
                                                                contact.emails.filter(
                                                                    (_, idx) =>
                                                                        idx !==
                                                                        i
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
                                        {contact.phones?.map((_, i) => (
                                            <div
                                                key={i}
                                                className="flex gap-2 mt-1"
                                            >
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
                                                            form.setValue(
                                                                'contactPersons.0.phones',
                                                                [
                                                                    ...contact.phones,
                                                                    '',
                                                                ]
                                                            )
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
                                                            form.setValue(
                                                                'contactPersons.0.phones',
                                                                contact.phones.filter(
                                                                    (_, idx) =>
                                                                        idx !==
                                                                        i
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
                            </>
                        )}
                    </CardContent>

                    <CardFooter className="flex gap-4">
                        <Button type="submit" disabled={updating}>
                            {updating ? <Spinner /> : 'Update Lead'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/leads')}
                        >
                            Cancel
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}
