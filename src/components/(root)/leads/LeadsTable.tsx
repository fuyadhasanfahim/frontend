'use client';

import React, { useMemo, useState } from 'react';
import { useGetLeadsQuery } from '@/redux/features/lead/leadApi';
import type { LeadStatus } from '@/types/lead';
import { LEAD_STATUSES } from '@/types/lead';
import { useDebounce } from '@/hooks/useDebounce';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableHeader,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import {
    IconSearch,
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconArrowsSort,
    IconChecks,
    IconX,
    IconWorld,
    IconBriefcase,
    IconUser,
    IconMail,
    IconPhone,
} from '@tabler/icons-react';
import LeadStatusBadge from './LeadStatusBadge';

type PageSize = 25 | 50 | 100 | 'all';

export default function LeadsTable() {
    // controls
    const [status, setStatus] = useState<LeadStatus | 'all'>('all');
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 400);

    const [page, setPage] = useState(1); // 1-based
    const [pageSize, setPageSize] = useState<PageSize>(25);

    const [sortBy, setSortBy] = useState<
        'companyName' | 'country' | 'status' | 'createdAt'
    >('companyName');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const queryArgs = useMemo(
        () => ({
            page,
            limit: pageSize,
            status,
            search: debouncedSearch || undefined,
            sortBy,
            sortDir,
        }),
        [page, pageSize, status, debouncedSearch, sortBy, sortDir]
    );

    const { data, isFetching, isLoading, isError } =
        useGetLeadsQuery(queryArgs);
    const rows = data?.data ?? [];
    const total = data?.total ?? 0;

    const totalPages = useMemo(() => {
        if (pageSize === 'all') return 1;
        return Math.max(1, Math.ceil(total / (pageSize || 1)));
    }, [total, pageSize]);

    const canPrev = page > 1;
    const canNext = page < totalPages;

    function toggleSort(field: typeof sortBy) {
        if (sortBy === field) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
    }

    function resetFilters() {
        setStatus('all');
        setSearch('');
        setPage(1);
        setPageSize(25);
        setSortBy('companyName');
        setSortDir('asc');
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <IconSearch
                            size={16}
                            className="absolute left-2 top-2.5 text-muted-foreground"
                        />
                        <Input
                            value={search}
                            onChange={(e) => {
                                setPage(1);
                                setSearch(e.target.value);
                            }}
                            placeholder="Search company, email, phone, country..."
                            className="pl-8 w-[260px]"
                        />
                    </div>

                    <Select
                        value={String(pageSize)}
                        onValueChange={(v) => {
                            const next = (
                                v === 'all' ? 'all' : Number(v)
                            ) as PageSize;
                            setPageSize(next);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Rows" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        onClick={resetFilters}
                        className="gap-1"
                    >
                        <IconX size={16} /> Reset
                    </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                    {isFetching
                        ? 'Refreshing…'
                        : total
                        ? `${total} results`
                        : 'No results'}
                </div>
            </div>

            {/* Status Tabs */}
            <Tabs
                value={status}
                onValueChange={(v) => {
                    setStatus(v as any);
                    setPage(1);
                }}
                className="w-full"
            >
                <TabsList className="flex flex-wrap">
                    <TabsTrigger value="all" className="capitalize">
                        All
                    </TabsTrigger>
                    {LEAD_STATUSES.map((s) => (
                        <TabsTrigger key={s} value={s} className="capitalize">
                            {s.replace('_', ' ')}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <Separator />

            {/* Table */}
            <div className="rounded-lg border bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    className="whitespace-nowrap min-w-[220px] cursor-pointer"
                                    onClick={() => toggleSort('companyName')}
                                >
                                    <div className="flex items-center gap-1">
                                        Company <IconArrowsSort size={16} />
                                    </div>
                                </TableHead>
                                <TableHead className="min-w-[200px]">
                                    Contact
                                </TableHead>
                                <TableHead className="min-w-[220px]">
                                    Emails
                                </TableHead>
                                <TableHead className="min-w-[180px]">
                                    Phones
                                </TableHead>
                                <TableHead
                                    className="min-w-[140px] cursor-pointer"
                                    onClick={() => toggleSort('country')}
                                >
                                    <div className="flex items-center gap-1">
                                        Country <IconArrowsSort size={16} />
                                    </div>
                                </TableHead>
                                <TableHead
                                    className="min-w-[160px] cursor-pointer"
                                    onClick={() => toggleSort('status')}
                                >
                                    <div className="flex items-center gap-1">
                                        Status <IconArrowsSort size={16} />
                                    </div>
                                </TableHead>
                                <TableHead className="min-w-[120px] text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {isLoading ? (
                                [...Array(6)].map((_, i) => (
                                    <TableRow key={i}>
                                        {[...Array(7)].map((__, j) => (
                                            <TableCell key={j}>
                                                <Skeleton className="h-5 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <div className="h-36 flex items-center justify-center text-muted-foreground">
                                            No leads found.
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((lead) => (
                                    <TableRow
                                        key={lead._id}
                                        className="hover:bg-stone-50"
                                    >
                                        <TableCell className="align-top">
                                            <div className="font-medium flex items-center gap-2">
                                                <IconBriefcase
                                                    size={16}
                                                    className="text-muted-foreground"
                                                />
                                                {lead.companyName}
                                            </div>
                                            {lead.websiteUrl && (
                                                <a
                                                    href={
                                                        lead.websiteUrl.startsWith(
                                                            'http'
                                                        )
                                                            ? lead.websiteUrl
                                                            : `https://${lead.websiteUrl}`
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-blue-600 hover:underline ml-6"
                                                >
                                                    {lead.websiteUrl}
                                                </a>
                                            )}
                                        </TableCell>

                                        <TableCell className="align-top">
                                            <div className="flex items-center gap-2">
                                                <IconUser
                                                    size={16}
                                                    className="text-muted-foreground"
                                                />
                                                <span>
                                                    {
                                                        lead.contactPerson
                                                            ?.firstName
                                                    }{' '}
                                                    {
                                                        lead.contactPerson
                                                            ?.lastName
                                                    }
                                                </span>
                                            </div>
                                            {lead.designation && (
                                                <div className="text-xs text-muted-foreground ml-6">
                                                    {lead.designation}
                                                </div>
                                            )}
                                        </TableCell>

                                        <TableCell className="align-top">
                                            <div className="flex flex-col gap-1">
                                                {lead.emails?.length ? (
                                                    lead.emails.map(
                                                        (e, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <IconMail
                                                                    size={14}
                                                                    className="text-muted-foreground"
                                                                />
                                                                <a
                                                                    href={`mailto:${e}`}
                                                                    className="hover:underline"
                                                                >
                                                                    {e}
                                                                </a>
                                                            </div>
                                                        )
                                                    )
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="align-top">
                                            <div className="flex flex-col gap-1">
                                                {lead.phones?.length ? (
                                                    lead.phones.map(
                                                        (p, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center gap-2"
                                                            >
                                                                <IconPhone
                                                                    size={14}
                                                                    className="text-muted-foreground"
                                                                />
                                                                <a
                                                                    href={`tel:${p}`}
                                                                    className="hover:underline"
                                                                >
                                                                    {p}
                                                                </a>
                                                            </div>
                                                        )
                                                    )
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="align-top">
                                            <div className="flex items-center gap-2">
                                                <IconWorld
                                                    size={16}
                                                    className="text-muted-foreground"
                                                />
                                                <span>
                                                    {lead.country || '—'}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="align-top">
                                            <LeadStatusBadge
                                                status={lead.status}
                                            />
                                        </TableCell>

                                        <TableCell className="align-top text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8"
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="h-8"
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer / Pagination */}
                <div className="p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                        {pageSize === 'all'
                            ? `Showing all ${rows.length} ${
                                  rows.length === 1 ? 'lead' : 'leads'
                              }`
                            : `Page ${page} of ${totalPages} • ${total} total`}
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(1)}
                            disabled={!canPrev}
                        >
                            <IconChevronsLeft size={16} />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={!canPrev}
                        >
                            <IconChevronLeft size={16} />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={!canNext}
                        >
                            <IconChevronRight size={16} />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(totalPages)}
                            disabled={!canNext}
                        >
                            <IconChevronsRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
