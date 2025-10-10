'use client';

import React from 'react';
import { useGetAssignmentsQuery } from '@/redux/features/lead/leadApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { ILead } from '@/types/lead.interface';
import { ILeadAssignment } from '@/types/lead-assignment.interface';
import { useSignedUser } from '@/hooks/useSignedUser';
import Link from 'next/link';

export default function RootTelemarketingPage() {
    const { user } = useSignedUser();

    const { data, isLoading, isError } = useGetAssignmentsQuery(
        user?._id as string,
        {
            skip: !user?._id,
        }
    );

    if (isLoading) return <Spinner />;
    if (isError)
        return <p className="text-red-500">Failed to load assignments</p>;

    const assignments: ILeadAssignment[] = data?.data || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Assigned Leads</CardTitle>
            </CardHeader>
            <CardContent>
                {assignments.length === 0 ? (
                    <p>No assignments found.</p>
                ) : (
                    assignments.map((assignment) => (
                        <div key={assignment._id} className="mb-6">
                            <h3 className="font-semibold mb-2">
                                Assignment: {assignment._id} | Status:{' '}
                                {assignment.status} | Target:{' '}
                                {assignment.totalTarget ?? '—'} | Deadline:{' '}
                                {assignment.deadline
                                    ? new Date(
                                          assignment.deadline
                                      ).toLocaleDateString()
                                    : '—'}
                            </h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignment.leads.map((lead: ILead) => (
                                        <TableRow key={lead._id}>
                                            <TableCell>
                                                {lead.companyName}
                                            </TableCell>
                                            <TableCell>
                                                {lead.emails?.join(', ')}
                                            </TableCell>
                                            <TableCell>
                                                {lead.phones?.join(', ')}
                                            </TableCell>
                                            <TableCell>{lead.status}</TableCell>
                                            <TableCell className="max-w-xs truncate underline">
                                                <Link
                                                    href={`telemarketing/leads/${lead._id}`}
                                                >
                                                    View
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
