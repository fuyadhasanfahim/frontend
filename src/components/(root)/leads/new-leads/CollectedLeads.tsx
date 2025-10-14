'use client';

import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ILead } from '@/types/lead.interface';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    ChevronDownIcon,
    ChevronLeft,
    ChevronRight,
    Ellipsis,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { IconEdit, IconInfoCircle } from '@tabler/icons-react';

interface CollectedLeadsProps {
    isLoading: boolean;
    isError: boolean;
    leads: ILead[];
    pagination: {
        totalItems: number;
        totalPages: number;
        currentPage: number;
        limit: number;
    };
    setPage: React.Dispatch<React.SetStateAction<number>>;
    setPerPage: (perPage: number) => void;
    setDate: (date: Date | undefined) => void;
    date: Date | undefined;
    perPage: number;
    page: number;
}

export default function CollectedLeads({
    isLoading,
    isError,
    leads,
    pagination,
    setPage,
    setPerPage,
    setDate,
    date,
    perPage,
    page,
}: CollectedLeadsProps) {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Daily Lead Summary</CardTitle>
                <CardDescription>
                    Showing all leads you’ve added on{' '}
                    {date ? format(date, 'PPP') : 'the selected day'}. Use the
                    calendar to browse other days.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex items-center gap-4 justify-end">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="date"
                                className="w-48 justify-between font-normal"
                            >
                                {date ? format(date, 'PPP') : 'Select date'}
                                <ChevronDownIcon />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                        >
                            <Calendar
                                mode="single"
                                selected={date}
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                    setDate(date);
                                    setOpen(false);
                                }}
                            />
                        </PopoverContent>
                    </Popover>

                    <Select
                        value={String(perPage)}
                        onValueChange={(val) => {
                            setPage(1);
                            setPerPage(Number(val));
                        }}
                    >
                        <SelectTrigger className="w-[120px] border-gray-300">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[20, 50, 100].map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Table>
                    <TableHeader className="bg-accent">
                        <TableRow>
                            <TableHead className="border">Company</TableHead>
                            <TableHead className="border">Website</TableHead>
                            <TableHead className="border">Full Name</TableHead>
                            <TableHead className="border">Emails</TableHead>
                            <TableHead className="border">Phones</TableHead>
                            <TableHead className="border">
                                Designation
                            </TableHead>
                            <TableHead className="border">Address</TableHead>
                            <TableHead className="border">Country</TableHead>
                            <TableHead className="border">Status</TableHead>
                            <TableHead className="border text-center">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: perPage }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 10 }).map((__, j) => (
                                        <TableCell key={j} className="border">
                                            <Skeleton className="h-6 w-24" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : isError ? (
                            <TableRow>
                                <TableCell
                                    colSpan={10}
                                    className="text-center py-12 text-destructive border"
                                >
                                    Failed to load leads
                                </TableCell>
                            </TableRow>
                        ) : leads.length ? (
                            leads.map((lead: ILead) => {
                                const contact = lead.contactPersons?.[0];
                                const fullName =
                                    [contact?.firstName, contact?.lastName]
                                        .filter(Boolean)
                                        .join(' ') || 'N/A';

                                return (
                                    <TableRow key={lead._id}>
                                        {/* Company */}
                                        <TableCell className="border font-medium">
                                            {lead.company.name}
                                        </TableCell>

                                        {/* Website */}
                                        <TableCell className="border text-blue-600 underline">
                                            {lead.company.website ? (
                                                <Link
                                                    href={
                                                        lead.company.website.startsWith(
                                                            'http'
                                                        )
                                                            ? lead.company
                                                                  .website
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
                                        <TableCell className="border">
                                            {fullName}
                                        </TableCell>

                                        {/* Emails */}
                                        <TableCell className="border text-xs truncate max-w-64">
                                            <div className="space-y-1">
                                                {lead.company.emails?.map(
                                                    (email, i) => (
                                                        <p
                                                            key={`co-email-${lead._id}-${i}`}
                                                        >
                                                            {email}
                                                        </p>
                                                    )
                                                )}
                                                {lead.contactPersons?.flatMap(
                                                    (cp, ci) =>
                                                        cp.emails?.map(
                                                            (email, ei) => (
                                                                <p
                                                                    key={`cp-email-${lead._id}-${ci}-${ei}`}
                                                                >
                                                                    {email}
                                                                </p>
                                                            )
                                                        )
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Phones */}
                                        <TableCell className="border text-xs truncate max-w-64">
                                            <div className="space-y-1">
                                                {lead.company.phones?.map(
                                                    (phone, i) => (
                                                        <p
                                                            key={`co-phone-${lead._id}-${i}`}
                                                        >
                                                            {phone}
                                                        </p>
                                                    )
                                                )}
                                                {lead.contactPersons?.flatMap(
                                                    (cp, ci) =>
                                                        cp.phones?.map(
                                                            (phone, pi) => (
                                                                <p
                                                                    key={`cp-phone-${lead._id}-${ci}-${pi}`}
                                                                >
                                                                    {phone}
                                                                </p>
                                                            )
                                                        )
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Designation */}
                                        <TableCell className="border">
                                            {contact?.designation || 'N/A'}
                                        </TableCell>

                                        {/* Address */}
                                        <TableCell className="border capitalize">
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

                                        {/* Actions */}
                                        <TableCell className="border text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                    >
                                                        <Ellipsis className="h-5 w-5 text-gray-600" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-36"
                                                >
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/leads/details/${lead._id}`}
                                                        >
                                                            <IconInfoCircle className="mr-2 h-4 w-4" />
                                                            Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/leads/edit/${lead._id}`}
                                                        >
                                                            <IconEdit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={10}
                                    className="text-center py-12 text-gray-500 border"
                                >
                                    No leads found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <CardFooter className="flex justify-between items-center pt-4">
                <div className="text-sm text-gray-600">
                    Showing{' '}
                    <span className="font-medium text-gray-900">
                        {(page - 1) * perPage + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium text-gray-900">
                        {Math.min(page * perPage, pagination.totalItems)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-gray-900">
                        {pagination.totalItems}
                    </span>{' '}
                    leads
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="gap-1"
                    >
                        <ChevronLeft />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="gap-1"
                    >
                        Next
                        <ChevronRight />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
