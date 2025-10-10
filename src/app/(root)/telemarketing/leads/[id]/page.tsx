/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    useGetLeadByIdQuery,
    useUpdateLeadByTelemarketerMutation,
} from '@/redux/features/lead/leadApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import type { ILead } from '@/types/lead.interface';

export default function LeadDetailsPage() {
    const params = useParams();
    const leadId = params.id as string;

    const {
        data: lead,
        isLoading,
        isError,
        refetch,
    } = useGetLeadByIdQuery(leadId);

    const [updateLeadByTelemarketer, { isLoading: updating }] =
        useUpdateLeadByTelemarketerMutation();

    const [status, setStatus] = useState<ILead['status'] | undefined>();
    const [note, setNote] = useState('');

    useEffect(() => {
        if (lead) {
            setStatus(lead.status);
        }
    }, [lead]);

    if (isLoading) return <Spinner />;
    if (isError) return <p className="text-red-500">Failed to load lead.</p>;
    if (!lead) return <p>No lead found.</p>;

    const handleUpdate = async () => {
        if (!status && !note) {
            toast.warning('Please select a status or add a note');
            return;
        }
        try {
            await updateLeadByTelemarketer({ leadId, status, note }).unwrap();
            toast.success('Lead updated successfully');
            setNote('');
            refetch();
        } catch (err: any) {
            console.log(err);
            toast.error(err?.data?.message || 'Failed to update lead');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Lead Info */}
                <div className="space-y-1">
                    <h2 className="text-lg font-semibold">
                        {lead.companyName}
                    </h2>
                    {lead.websiteUrl && <p>🌐 {lead.websiteUrl}</p>}
                    <p>📧 {lead.emails?.join(', ')}</p>
                    <p>📞 {lead.phones?.join(', ')}</p>
                    <p>
                        👤 {lead.contactPerson.firstName}{' '}
                        {lead.contactPerson.lastName}
                    </p>
                    <p>🌍 {lead.country}</p>
                </div>

                {/* Status Update */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Update Status</label>
                    <Select
                        value={status}
                        onValueChange={(val) =>
                            setStatus(val as ILead['status'])
                        }
                    >
                        <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {[
                                'new',
                                'contacted',
                                'responded',
                                'qualified',
                                'meeting_scheduled',
                                'proposal',
                                'won',
                                'lost',
                                'on_hold',
                            ].map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Add Note</label>
                    <Textarea
                        placeholder="Write a note..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                    <Button onClick={handleUpdate} disabled={updating}>
                        {updating ? 'Updating...' : 'Save Changes'}
                    </Button>
                </div>

                {/* Activity Log */}
                {lead.activities?.length > 0 && (
                    <div>
                        <h3 className="font-semibold mb-2">Activity Log</h3>
                        <ul className="space-y-1 text-sm">
                            {lead.activities.map((a: any, idx: any) => (
                                <li key={idx}>
                                    [{new Date(a.at).toLocaleString()}] {a.type}{' '}
                                    → {a.content}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
