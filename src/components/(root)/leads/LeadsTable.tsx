'use client';

import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useGetLeadsQuery } from '@/redux/features/lead/leadApi';
import { Skeleton } from '@/components/ui/skeleton';

type LeadStatus =
    | 'new'
    | 'contacted'
    | 'responded'
    | 'qualified'
    | 'meeting_scheduled'
    | 'proposal'
    | 'won'
    | 'lost'
    | 'on_hold';

const STATUSES: LeadStatus[] = [
    'new',
    'contacted',
    'responded',
    'qualified',
    'meeting_scheduled',
    'proposal',
    'won',
    'lost',
    'on_hold',
];

const statusColors: Record<LeadStatus, string> = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    contacted: 'bg-purple-50 text-purple-700 border-purple-200',
    responded: 'bg-teal-50 text-teal-700 border-teal-200',
    qualified: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    meeting_scheduled: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    proposal: 'bg-orange-50 text-orange-700 border-orange-200',
    won: 'bg-green-50 text-green-700 border-green-200',
    lost: 'bg-red-50 text-red-700 border-red-200',
    on_hold: 'bg-gray-50 text-gray-700 border-gray-200',
};

type SortOption =
    | 'companyAsc'
    | 'companyDesc'
    | 'countryAsc'
    | 'countryDesc'
    | 'statusAsc'
    | 'statusDesc'
    | 'dateAsc'
    | 'dateDesc';

export default function LeadsTable() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
    const [sort, setSort] = useState<SortOption>('dateDesc');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);

    const getSortParams = () => {
        switch (sort) {
            case 'companyAsc':
                return { sortBy: 'companyName', sortOrder: 'asc' };
            case 'companyDesc':
                return { sortBy: 'companyName', sortOrder: 'desc' };
            case 'countryAsc':
                return { sortBy: 'country', sortOrder: 'asc' };
            case 'countryDesc':
                return { sortBy: 'country', sortOrder: 'desc' };
            case 'statusAsc':
                return { sortBy: 'status', sortOrder: 'asc' };
            case 'statusDesc':
                return { sortBy: 'status', sortOrder: 'desc' };
            case 'dateAsc':
                return { sortBy: 'createdAt', sortOrder: 'asc' };
            case 'dateDesc':
                return { sortBy: 'createdAt', sortOrder: 'desc' };
            default:
                return { sortBy: 'createdAt', sortOrder: 'desc' };
        }
    };

    const { sortBy, sortOrder } = getSortParams();

    const { data, isLoading, isError } = useGetLeadsQuery({
        page,
        limit: perPage,
        search,
        status: statusFilter,
        sortBy,
        sortOrder,
    });

    const leads = data?.data ?? [];
    const pagination = data?.pagination ?? { total: 0, totalPages: 1 };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName?.charAt(0) || ''}${
            lastName?.charAt(0) || ''
        }`.toUpperCase();
    };

    return (
        <TooltipProvider>
            <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-6">
                {/* Tabs */}
                <Tabs
                    value={statusFilter}
                    onValueChange={(val) => {
                        setPage(1);
                        setStatusFilter(val as LeadStatus | 'all');
                    }}
                >
                    <TabsList className="bg-gray-100 p-1">
                        <TabsTrigger
                            value="all"
                            className="data-[state=active]:bg-white"
                        >
                            All
                        </TabsTrigger>
                        {STATUSES.map((s) => (
                            <TabsTrigger
                                key={s}
                                value={s}
                                className="capitalize data-[state=active]:bg-white"
                            >
                                {s.replace('_', ' ')}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {/* Search + Sort + Per Page */}
                <div className="flex flex-wrap justify-between items-center gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by company, email, or country..."
                            value={search}
                            onChange={(e) => {
                                setPage(1);
                                setSearch(e.target.value);
                            }}
                            className="pl-10 border-gray-300"
                        />
                    </div>

                    <div className="flex gap-3">
                        <Select
                            value={sort}
                            onValueChange={(val) => setSort(val as SortOption)}
                        >
                            <SelectTrigger className="w-[170px] border-gray-300">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="companyAsc">
                                    Company A-Z
                                </SelectItem>
                                <SelectItem value="companyDesc">
                                    Company Z-A
                                </SelectItem>
                                <SelectItem value="countryAsc">
                                    Country A-Z
                                </SelectItem>
                                <SelectItem value="countryDesc">
                                    Country Z-A
                                </SelectItem>
                                <SelectItem value="statusAsc">
                                    Status A-Z
                                </SelectItem>
                                <SelectItem value="statusDesc">
                                    Status Z-A
                                </SelectItem>
                                <SelectItem value="dateAsc">
                                    Oldest first
                                </SelectItem>
                                <SelectItem value="dateDesc">
                                    Newest first
                                </SelectItem>
                            </SelectContent>
                        </Select>

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
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-semibold text-gray-700">
                                    Company
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                    Contact
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                    Contact Info
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                    Location
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                    Status
                                </TableHead>
                                <TableHead className="font-semibold text-gray-700">
                                    Team
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: perPage }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell>
                                            <Skeleton className="h-4 w-32" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-24" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-40" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-4 w-20" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-6 w-20" />
                                        </TableCell>
                                        <TableCell>
                                            <Skeleton className="h-8 w-24" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : isError ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center py-12"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                                <span className="text-red-600 text-xl">
                                                    !
                                                </span>
                                            </div>
                                            <p className="text-red-600 font-medium">
                                                Failed to load leads
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Please try again later
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : leads.length ? (
                                leads.map((lead: any, idx: number) => (
                                    <TableRow
                                        key={lead._id}
                                        className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                                    >
                                        {/* Company */}
                                        <TableCell>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900">
                                                    {lead.companyName}
                                                </p>
                                                {lead.websiteUrl && (
                                                    <a
                                                        href={lead.websiteUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:text-blue-700 truncate"
                                                    >
                                                        {lead.websiteUrl.replace(
                                                            /^https?:\/\/(www\.)?/,
                                                            ''
                                                        )}
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Contact Person */}
                                        <TableCell>
                                            {lead.contactPerson?.firstName && (
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">
                                                        {
                                                            lead.contactPerson
                                                                .firstName
                                                        }{' '}
                                                        {
                                                            lead.contactPerson
                                                                .lastName
                                                        }
                                                    </p>
                                                    {lead.designation && (
                                                        <p className="text-xs text-gray-500">
                                                            {lead.designation}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>

                                        {/* Contact Info */}
                                        <TableCell>
                                            <div className="space-y-1">
                                                {Array.isArray(lead.emails) &&
                                                    lead.emails.length > 0 && (
                                                        <div>
                                                            <p className="text-sm text-gray-700">
                                                                {lead.emails[0]}
                                                            </p>
                                                            {lead.emails
                                                                .length > 1 && (
                                                                <span className="text-xs text-gray-500">
                                                                    +
                                                                    {lead.emails
                                                                        .length -
                                                                        1}{' '}
                                                                    more
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                {Array.isArray(lead.phones) &&
                                                    lead.phones.length > 0 && (
                                                        <p className="text-sm text-gray-600">
                                                            {lead.phones[0]}
                                                        </p>
                                                    )}
                                            </div>
                                        </TableCell>

                                        {/* Location */}
                                        <TableCell>
                                            <span className="text-gray-700">
                                                {lead.country}
                                            </span>
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`${
                                                    statusColors[
                                                        lead.status as LeadStatus
                                                    ]
                                                } border font-medium capitalize`}
                                            >
                                                {lead.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>

                                        {/* Team Access */}
                                        <TableCell>
                                            {lead.accessList &&
                                            lead.accessList.length > 0 ? (
                                                <div className="flex -space-x-2">
                                                    {lead.accessList
                                                        .slice(0, 4)
                                                        .map(
                                                            (
                                                                access: any,
                                                                index: number
                                                            ) => (
                                                                <Tooltip
                                                                    key={index}
                                                                >
                                                                    <TooltipTrigger>
                                                                        <Avatar className="h-8 w-8 border-2 border-white">
                                                                            <AvatarImage
                                                                                src={
                                                                                    access
                                                                                        .user
                                                                                        ?.image
                                                                                }
                                                                                alt={`${access.user?.firstName} ${access.user?.lastName}`}
                                                                            />
                                                                            <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                                                                                {getInitials(
                                                                                    access
                                                                                        .user
                                                                                        ?.firstName ||
                                                                                        '',
                                                                                    access
                                                                                        .user
                                                                                        ?.lastName ||
                                                                                        ''
                                                                                )}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <div className="text-xs">
                                                                            <p className="font-semibold">
                                                                                {
                                                                                    access
                                                                                        .user
                                                                                        ?.firstName
                                                                                }{' '}
                                                                                {
                                                                                    access
                                                                                        .user
                                                                                        ?.lastName
                                                                                }
                                                                            </p>
                                                                            <p className="text-gray-600">
                                                                                {
                                                                                    access
                                                                                        .user
                                                                                        ?.email
                                                                                }
                                                                            </p>
                                                                            <p className="text-gray-500 capitalize mt-0.5">
                                                                                {
                                                                                    access.role
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )
                                                        )}
                                                    {lead.accessList.length >
                                                        4 && (
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                                                                    <span className="text-xs font-medium text-gray-600">
                                                                        +
                                                                        {lead
                                                                            .accessList
                                                                            .length -
                                                                            4}
                                                                    </span>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="text-xs">
                                                                    {lead
                                                                        .accessList
                                                                        .length -
                                                                        4}{' '}
                                                                    more team
                                                                    members
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-400">
                                                    No access
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center py-12"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                                <span className="text-gray-400 text-xl">
                                                    👤
                                                </span>
                                            </div>
                                            <p className="text-gray-600 font-medium">
                                                No leads found
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Try adjusting your filters or
                                                search
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                        Showing{' '}
                        <span className="font-medium text-gray-900">
                            {(page - 1) * perPage + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium text-gray-900">
                            {Math.min(page * perPage, pagination.total)}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium text-gray-900">
                            {pagination.total}
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
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {Array.from(
                                {
                                    length: Math.min(5, pagination.totalPages),
                                },
                                (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (page <= 3) {
                                        pageNum = i + 1;
                                    } else if (
                                        page >=
                                        pagination.totalPages - 2
                                    ) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = page - 2 + i;
                                    }
                                    return (
                                        <Button
                                            key={i}
                                            variant={
                                                page === pageNum
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            onClick={() => setPage(pageNum)}
                                            className={
                                                page === pageNum
                                                    ? 'bg-gray-900 hover:bg-gray-800'
                                                    : ''
                                            }
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                }
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={
                                page === pagination.totalPages ||
                                pagination.totalPages === 0
                            }
                            onClick={() => setPage((p) => p + 1)}
                            className="gap-1"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
