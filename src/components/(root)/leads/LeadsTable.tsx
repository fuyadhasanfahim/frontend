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
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useGetLeadsQuery } from '@/redux/features/lead/leadApi';
import { Skeleton } from '@/components/ui/skeleton';
import { ILead } from '@/types/lead.interface';
import { useGetCountriesQuery } from '@/redux/features/country/countryApi';

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
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [sort, setSort] = useState<SortOption>('dateDesc');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);

    const { data: countries } = useGetCountriesQuery({});

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
    });
    console.log(data);

    const leads = data?.data ?? [];
    const pagination = data?.pagination ?? { total: 0, totalPages: 1 };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-6">
            {/* Filters */}
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
                    {/* Sort */}
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

                    {/* Country Filter */}
                    <Select
                        value={countryFilter}
                        onValueChange={(val) => {
                            setPage(1);
                            setCountryFilter(val);
                        }}
                    >
                        <SelectTrigger className="w-[160px] border-gray-300 capitalize">
                            <SelectValue placeholder="Filter by country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
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
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead>Company Name</TableHead>
                            <TableHead>Website</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>First Name</TableHead>
                            <TableHead>Last Name</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: perPage }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 7 }).map((__, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-4 w-24" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : isError ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="text-center py-12 text-red-600"
                                >
                                    Failed to load leads
                                </TableCell>
                            </TableRow>
                        ) : leads.length ? (
                            leads.map((lead: ILead) => (
                                <TableRow key={lead._id}>
                                    <TableCell>{lead.companyName}</TableCell>
                                    <TableCell>{lead.websiteUrl}</TableCell>
                                    <TableCell>{lead.country}</TableCell>
                                    <TableCell className="capitalize">
                                        {lead.status.replace('_', ' ')}
                                    </TableCell>
                                    <TableCell>{lead.designation}</TableCell>
                                    <TableCell>
                                        {lead.contactPerson?.firstName}
                                    </TableCell>
                                    <TableCell>
                                        {lead.contactPerson?.lastName}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
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
        </div>
    );
}
