'use client';

import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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

// ✅ Zod validation schema
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

    // ✅ Manage dynamic contactPersons array
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'contactPersons',
    });

    // ✅ Pre-fill form with lead data
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

    // ✅ Company field array helpers
    const companyEmails = form.watch('company.emails');
    const setCompanyEmails = (next: string[]) =>
        form.setValue('company.emails', next);

    const companyPhones = form.watch('company.phones');
    const setCompanyPhones = (next: string[]) =>
        form.setValue('company.phones', next);

    // ✅ Submit handler
    const onSubmit = async (values: LeadFormValues) => {
        try {
            const res = await updateLead({ id, body: values }).unwrap();
            if (res.success) {
                toast.success('Lead updated successfully!');
                router.push('/leads');
            }
        } catch (err: any) {
            toast.error(
                err?.data?.message ||
                    (err as Error).message ||
                    'Failed to update lead.'
            );
        }
    };

    if (loadingLead) {
        return (
            <div className="p-8 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Loading Lead Data...</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Spinner />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isError)
        return (
            <div className="p-8 text-center text-gray-500">
                <p>Failed to load lead information.</p>
            </div>
        );

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="max-w-5xl w-full mx-auto mt-6 space-y-8"
            >
                {/* --- Company Info --- */}
                <Card>
                    <CardHeader>
                        <CardTitle>Company Information</CardTitle>
                        <CardDescription>
                            Basic details about the company.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Company Name *</Label>
                                <Input
                                    {...form.register('company.name')}
                                    placeholder="Enter company name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Website *</Label>
                                <Input
                                    {...form.register('company.website')}
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>

                        {/* --- Emails + Phones --- */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
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

                            <div className="space-y-2">
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

                        {/* --- Address + Country --- */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input
                                    {...form.register('address')}
                                    placeholder="Enter address"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Country *</Label>
                                <CountrySelect
                                    value={form.watch('country')}
                                    onChange={(val) =>
                                        form.setValue('country', val)
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* --- Contact Persons --- */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Person(s)</CardTitle>
                        <CardDescription>
                            Add one or more contact persons.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {fields.map((field, index) => {
                            const contactEmails = form.watch(
                                `contactPersons.${index}.emails`
                            );
                            const setEmails = (next: string[]) =>
                                form.setValue(
                                    `contactPersons.${index}.emails`,
                                    next
                                );

                            const contactPhones = form.watch(
                                `contactPersons.${index}.phones`
                            );
                            const setPhones = (next: string[]) =>
                                form.setValue(
                                    `contactPersons.${index}.phones`,
                                    next
                                );

                            return (
                                <div
                                    key={field.id}
                                    className="p-4 border rounded-lg space-y-4"
                                >
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold">
                                            Contact Person {index + 1}
                                        </h3>
                                        {fields.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => remove(index)}
                                            >
                                                <IconTrash className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>First Name *</Label>
                                            <Input
                                                {...form.register(
                                                    `contactPersons.${index}.firstName`
                                                )}
                                                placeholder="First name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Last Name</Label>
                                            <Input
                                                {...form.register(
                                                    `contactPersons.${index}.lastName`
                                                )}
                                                placeholder="Last name"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Emails */}
                                        <div className="space-y-2">
                                            <Label>Email(s)</Label>
                                            {contactEmails.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="flex gap-2 mt-1"
                                                >
                                                    <Input
                                                        {...form.register(
                                                            `contactPersons.${index}.emails.${i}`
                                                        )}
                                                        placeholder="email@example.com"
                                                    />
                                                    {i === 0 ? (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() =>
                                                                setEmails([
                                                                    ...contactEmails,
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
                                                                setEmails(
                                                                    contactEmails.filter(
                                                                        (
                                                                            _,
                                                                            idx
                                                                        ) =>
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

                                        {/* Phones */}
                                        <div className="space-y-2">
                                            <Label>Phone(s)</Label>
                                            {contactPhones.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="flex gap-2 mt-1"
                                                >
                                                    <Input
                                                        {...form.register(
                                                            `contactPersons.${index}.phones.${i}`
                                                        )}
                                                        placeholder="01xxxxxxxxx"
                                                    />
                                                    {i === 0 ? (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() =>
                                                                setPhones([
                                                                    ...contactPhones,
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
                                                                setPhones(
                                                                    contactPhones.filter(
                                                                        (
                                                                            _,
                                                                            idx
                                                                        ) =>
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

                                        <div className="space-y-2 col-span-2">
                                            <Label>Designation</Label>
                                            <Input
                                                {...form.register(
                                                    `contactPersons.${index}.designation`
                                                )}
                                                placeholder="Designation"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add Another Person */}
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() =>
                                append({
                                    firstName: '',
                                    lastName: '',
                                    designation: '',
                                    emails: [''],
                                    phones: [''],
                                })
                            }
                        >
                            <IconPlus className="mr-1" />
                            Add Another Contact Person
                        </Button>

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                {...form.register('notes')}
                                placeholder="Additional notes..."
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex gap-4">
                        <Button type="submit" disabled={updating}>
                            {updating ? <Spinner /> : 'Save Changes'}
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
