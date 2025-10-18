'use client';

import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ILead } from '@/types/lead.interface';
import { OUTCOME_LABELS } from './RootTaskDetailsPage';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LeadsTable({
    leads,
    handleStatusSelect,
}: {
    leads: ILead[];
    handleStatusSelect: (lead: ILead) => void;
}) {
    return (
        <Table>
            <TableHeader className="bg-accent">
                <TableRow>
                    <TableHead className="border">Company</TableHead>
                    <TableHead className="border">Contact Person</TableHead>
                    <TableHead className="border">Emails</TableHead>
                    <TableHead className="border">Phones</TableHead>
                    <TableHead className="border">Designation</TableHead>
                    <TableHead className="border">Address</TableHead>
                    <TableHead className="border">Country</TableHead>
                    <TableHead className="border">Status</TableHead>
                    <TableHead className="border">Outcome</TableHead>
                    <TableHead className="border">Notes</TableHead>
                    <TableHead className="border text-center">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {leads.length ? (
                    leads.map((lead) => (
                        <TableRow key={lead._id}>
                            <TableCell className="border max-w-[200px] truncate">
                                <p className="font-medium">
                                    {lead.company.name}
                                </p>
                                {lead.company.website && (
                                    <Link
                                        href={lead.company.website}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 text-xs underline"
                                    >
                                        {lead.company.website}
                                    </Link>
                                )}
                            </TableCell>
                            <TableCell className="border max-w-[200px] truncate">
                                {lead.contactPersons.length > 0
                                    ? lead.contactPersons.map((cp, i) => (
                                          <p key={i}>
                                              {cp.firstName} {cp.lastName}
                                          </p>
                                      ))
                                    : '-'}
                            </TableCell>
                            <TableCell className="border text-xs">
                                {lead.contactPersons.flatMap((cp, i) =>
                                    cp.emails?.map((e, j) => (
                                        <p key={`cp-${i}-email-${j}`}>{e}</p>
                                    ))
                                )}
                            </TableCell>
                            <TableCell className="border text-xs">
                                {lead.contactPersons.flatMap((cp, i) =>
                                    cp.phones?.map((p, j) => (
                                        <p key={`cp-${i}-phone-${j}`}>{p}</p>
                                    ))
                                )}
                            </TableCell>
                            <TableCell className="border">
                                {lead.contactPersons.map((cp, i) => (
                                    <p key={`cp-des-${i}`}>
                                        {cp.designation || '-'}
                                    </p>
                                ))}
                            </TableCell>
                            <TableCell className="border max-w-[100px] truncate">
                                {lead.address || '-'}
                            </TableCell>
                            <TableCell className="border capitalize">
                                {lead.country}
                            </TableCell>
                            <TableCell className="border capitalize max-w-[200px] truncate">
                                {lead.status}
                            </TableCell>
                            <TableCell className="border capitalize">
                                {lead.activities?.map((a, i) => (
                                    <p key={`outcome-${lead._id}-${i}`}>
                                        {
                                            OUTCOME_LABELS[
                                                a.outcomeCode as keyof typeof OUTCOME_LABELS
                                            ]
                                        }
                                    </p>
                                )) || 'N/A'}
                            </TableCell>
                            <TableCell className="border max-w-[200px] truncate">
                                {lead.notes || 'N/A'}
                            </TableCell>
                            <TableCell className="border text-center">
                                <Button
                                    size="sm"
                                    variant="link"
                                    onClick={() => handleStatusSelect(lead)}
                                >
                                    Update
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell
                            colSpan={10}
                            className="text-center py-10 text-gray-500 border"
                        >
                            No leads found for this task.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
