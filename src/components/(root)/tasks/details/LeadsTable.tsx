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
                    <TableHead className="border">Website</TableHead>
                    <TableHead className="border">Full Name</TableHead>
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
                            <TableCell className="border font-medium max-w-[200px] truncate">
                                {lead.company.name}
                            </TableCell>

                            {/* Website */}
                            <TableCell className="border text-blue-600 underline max-w-[200px] truncate">
                                {lead.company.website ? (
                                    <Link
                                        href={
                                            lead.company.website.startsWith(
                                                'http'
                                            )
                                                ? lead.company.website
                                                : `https://${lead.company.website}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-blue-700"
                                    >
                                        {lead.company.website}
                                    </Link>
                                ) : (
                                    'N/A'
                                )}
                            </TableCell>

                            {/* Full Name */}
                            <TableCell className="border capitalize">
                                {lead.contactPersons[0].firstName}{' '}
                                {lead.contactPersons[0].lastName}
                            </TableCell>

                            {/* Emails */}
                            <TableCell className="border truncate max-w-[200px]">
                                <div className="space-y-1">
                                    {lead.contactPersons?.flatMap((cp, ci) =>
                                        cp.emails?.map((email, ei) => (
                                            <p
                                                key={`cp-email-${lead._id}-${ci}-${ei}`}
                                            >
                                                {email}
                                            </p>
                                        ))
                                    )}
                                </div>
                            </TableCell>

                            {/* Phones */}
                            <TableCell className="border truncate max-w-[200px]">
                                <div className="space-y-1">
                                    {lead.contactPersons?.flatMap((cp, ci) =>
                                        cp.phones?.map((phone, pi) => (
                                            <p
                                                key={`cp-phone-${lead._id}-${ci}-${pi}`}
                                            >
                                                {phone}
                                            </p>
                                        ))
                                    )}
                                </div>
                            </TableCell>

                            {/* Designation */}
                            <TableCell className="border truncate max-w-[200px] capitalize">
                                {lead.contactPersons[0]?.designation || 'N/A'}
                            </TableCell>

                            {/* Address */}
                            <TableCell className="border max-w-[200px] truncate capitalize">
                                {lead.address || 'N/A'}
                            </TableCell>

                            {/* Country */}
                            <TableCell className="border capitalize">
                                {lead.country || 'N/A'}
                            </TableCell>

                            {/* Status */}
                            <TableCell className="border capitalize">
                                {lead.status.replace('_', ' ')}
                            </TableCell>
                            <TableCell className="border capitalize truncate max-w-[200px]">
                                {lead.activities && lead.activities?.length > 0
                                    ? lead.activities?.map(
                                          (a) =>
                                              OUTCOME_LABELS[
                                                  a.outcomeCode as keyof typeof OUTCOME_LABELS
                                              ]
                                      )
                                    : 'N/A'}
                            </TableCell>
                            <TableCell className="border max-w-[200px] truncate">
                                {(lead.activities &&
                                    lead.activities[0]?.notes) ||
                                    'N/A'}
                            </TableCell>
                            <TableCell className="border text-center">
                                <Button
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
