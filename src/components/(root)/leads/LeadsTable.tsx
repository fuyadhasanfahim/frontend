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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Ellipsis, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useGetLeadsQuery } from '@/redux/features/lead/leadApi';
import { Skeleton } from '@/components/ui/skeleton';
import { ILead } from '@/types/lead.interface';
import { useGetCountriesQuery } from '@/redux/features/country/countryApi';
import Link from 'next/link';
import { IconEdit, IconInfoCircle } from '@tabler/icons-react';

type SortOption =
    | 'companyAsc'
    | 'companyDesc'
    | 'countryAsc'
    | 'countryDesc'
    | 'statusAsc'
    | 'statusDesc'
    | 'dateAsc'
    | 'dateDesc';

const STATUS_TABS = [
    'all',
    'new',
    'contacted',
    'responded',
    'qualified',
    'meetingScheduled',
    'proposal',
    'won',
    'lost',
    'onHold',
] as const;

export default function LeadsTable() {
    const [search, setSearch] = useState('');
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [sort, setSort] = useState<SortOption>('dateDesc');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [status, setStatus] = useState<string>('all');

    const { data: countries } = useGetCountriesQuery({});

    const getSortParams = () => {
        switch (sort) {
            case 'companyAsc':
                return { sortBy: 'company.name', sortOrder: 'asc' };
            case 'companyDesc':
                return { sortBy: 'company.name', sortOrder: 'desc' };
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
            default:
                return { sortBy: 'createdAt', sortOrder: 'desc' };
        }
    };

    const { sortBy, sortOrder } = getSortParams();

    const { data, isLoading, isError } = useGetLeadsQuery({
        page,
        limit: perPage,
        search,
        country: countryFilter,
        sortBy,
        sortOrder,
        status,
    });

    const leads = data?.data ?? [];
    const pagination = data?.pagination ?? { totalItems: 0, totalPages: 1 };

    return (
        <div className="rounded-lg border bg-white p-6 space-y-6">
            {/* Status Tabs */}
            <Tabs
                defaultValue="all"
                value={status}
                onValueChange={(val) => {
                    setStatus(val);
                    setPage(1);
                }}
            >
                <TabsList className="w-full overflow-x-auto flex-nowrap">
                    {STATUS_TABS.map((s) => (
                        <TabsTrigger
                            key={s}
                            value={s}
                            className="capitalize whitespace-nowrap"
                        >
                            {s === 'all' ? 'All' : s.replace(/([A-Z])/g, ' $1')}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={status}>
                    {/* Filters */}
                    <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by company, contact, or country..."
                                value={search}
                                onChange={(e) => {
                                    setPage(1);
                                    setSearch(e.target.value);
                                }}
                                className="pl-10 border-gray-300"
                            />
                        </div>

                        <div className="flex gap-3">
                            {/* Sort */}
                            <Select
                                value={sort}
                                onValueChange={(val) =>
                                    setSort(val as SortOption)
                                }
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

                            {/* Country Filter */}
                            <Select
                                value={countryFilter}
                                onValueChange={(val) => {
                                    setPage(1);
                                    setCountryFilter(val);
                                }}
                            >
                                <SelectTrigger className="capitalize">
                                    <SelectValue placeholder="Country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Countries
                                    </SelectItem>
                                    {countries?.map((c, i) => (
                                        <SelectItem
                                            key={i}
                                            value={c.name}
                                            className="capitalize"
                                        >
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Per Page */}
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
                    <div className="mt-6 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-accent">
                                <TableRow>
                                    <TableHead className="border">
                                        Company
                                    </TableHead>
                                    <TableHead className="border">
                                        Website
                                    </TableHead>
                                    <TableHead className="border">
                                        Full Name
                                    </TableHead>
                                    <TableHead className="border">
                                        Designation
                                    </TableHead>
                                    <TableHead className="border">
                                        Country
                                    </TableHead>
                                    <TableHead className="border">
                                        Status
                                    </TableHead>
                                    <TableHead className="border text-center">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: perPage }).map(
                                        (_, i) => (
                                            <TableRow key={i}>
                                                {Array.from({ length: 7 }).map(
                                                    (__, j) => (
                                                        <TableCell
                                                            key={j}
                                                            className="border"
                                                        >
                                                            <Skeleton className="h-6 w-24" />
                                                        </TableCell>
                                                    )
                                                )}
                                            </TableRow>
                                        )
                                    )
                                ) : isError ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center py-12 text-destructive"
                                        >
                                            Failed to load leads
                                        </TableCell>
                                    </TableRow>
                                ) : leads.length ? (
                                    leads.map((lead: ILead) => {
                                        const contact =
                                            lead.contactPersons?.[0];
                                        const fullName =
                                            [
                                                contact?.firstName,
                                                contact?.lastName,
                                            ]
                                                .filter(Boolean)
                                                .join(' ') || 'N/A';
                                        return (
                                            <TableRow key={lead._id}>
                                                <TableCell className="border font-medium">
                                                    {lead.company.name}
                                                </TableCell>
                                                <TableCell className="border">
                                                    {
                                                        <Link
                                                            href={
                                                                lead.company
                                                                    .website
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-400 hover:underline"
                                                        >
                                                            {
                                                                lead.company
                                                                    .website
                                                            }
                                                        </Link>
                                                    }
                                                </TableCell>
                                                <TableCell className="border">
                                                    {fullName}
                                                </TableCell>
                                                <TableCell className="border">
                                                    {contact?.designation ||
                                                        'N/A'}
                                                </TableCell>
                                                <TableCell className="border capitalize">
                                                    {lead.country}
                                                </TableCell>
                                                <TableCell className="border capitalize">
                                                    {lead.status.replace(
                                                        '_',
                                                        ' '
                                                    )}
                                                </TableCell>
                                                <TableCell className="border text-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                            >
                                                                <Ellipsis className="h-5 w-5 text-gray-600" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={`/leads/details/${lead._id}`}
                                                                >
                                                                    <IconInfoCircle />
                                                                    Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={`/leads/edit/${lead._id}`}
                                                                >
                                                                    <IconEdit />
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
                                            colSpan={7}
                                            className="text-center py-12 text-gray-500"
                                        >
                                            No leads found
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-4">
                        <div className="text-sm text-gray-600">
                            Showing{' '}
                            <span className="font-medium text-gray-900">
                                {(page - 1) * perPage + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium text-gray-900">
                                {Math.min(
                                    page * perPage,
                                    pagination.totalItems
                                )}
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
                                <ChevronLeft className="h-4 w-4" />
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
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
