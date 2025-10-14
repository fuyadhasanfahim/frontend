'use client';

import React, { useState, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetCountriesQuery } from '@/redux/features/country/countryApi';
import { useGetLeadsQuery } from '@/redux/features/lead/leadApi';
import { useCreateTaskMutation } from '@/redux/features/task/taskApi';
import { useGetAllUsersQuery } from '@/redux/features/user/userApi';
import { useSignedUser } from '@/hooks/useSignedUser';
import { ILead } from '@/types/lead.interface';
import { toast } from 'sonner';

// ---------- Types ----------
interface IUser {
    _id: string;
    firstName: string;
    lastName?: string;
    email?: string;
    role: string;
    image?: string;
}

type SortOption = 'companyAsc' | 'companyDesc' | 'countryAsc' | 'countryDesc';

const ROLES = [
    'lead-generator',
    'telemarketer',
    'digital-marketer',
    'seo-executive',
    'social-media-executive',
    'web-developer',
    'photo-editor',
    'graphic-designer',
] as const;

export default function RootLeadCreateTaskPage() {
    const { user, isLoading: userLoading } = useSignedUser();

    const [selectedRole, setSelectedRole] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [countryFilter, setCountryFilter] = useState('all');
    const [sort, setSort] = useState<SortOption>('companyAsc');

    const { data: countries } = useGetCountriesQuery({});
    const {
        data: usersData,
        isLoading: usersLoading,
        isFetching: usersFetching,
    } = useGetAllUsersQuery(undefined);

    const { data, isLoading: leadsLoading } = useGetLeadsQuery({
        page,
        limit: perPage,
        country: countryFilter,
        sortBy: sort.includes('company') ? 'company.name' : 'country',
        sortOrder: sort.endsWith('Asc') ? 'asc' : 'desc',
        status: 'new',
    });

    console.log(data);

    const leads = data?.data ?? [];
    const pagination = data?.pagination ?? { totalItems: 0, totalPages: 1 };
    const [createTask, { isLoading: creating }] = useCreateTaskMutation();

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedLeads(leads.map((lead: ILead) => lead._id));
        else setSelectedLeads([]);
    };

    const handleToggleLead = (id: string) => {
        setSelectedLeads((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleCreateTask = async () => {
        if (!selectedUser) return toast.error('Please select a user');
        if (selectedLeads.length === 0)
            return toast.error('Please select at least one lead');

        try {
            const res = await createTask({
                title: `Lead Assignment - ${new Date().toLocaleDateString()}`,
                description: `Lead generation task assigned to ${selectedUser}`,
                type: 'lead_generation',
                quantity: selectedLeads.length,
                assignedTo: selectedUser,
                leads: selectedLeads,
            }).unwrap();

            toast.success(res.message || 'Task created successfully!');
            setSelectedLeads([]);
        } catch (err) {
            const message =
                (err as { data?: { message?: string } })?.data?.message ??
                'Failed to create task';
            toast.error(message);
        }
    };

    const filteredUsers: IUser[] = useMemo(() => {
        if (!usersData?.users) return [];
        if (!selectedRole)
            return usersData.users.filter((u: IUser) => u._id !== user?._id);
        return usersData.users.filter(
            (u: IUser) => u.role === selectedRole && u._id !== user?._id
        );
    }, [usersData, selectedRole, user?._id]);

    if (userLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner className="w-8 h-8" />
            </div>
        );
    }

    // ---------- UI ----------
    return (
        <div className="p-6 space-y-6 rounded-lg border bg-card">
            <h2 className="text-xl font-semibold">
                Create Lead Generation Task
            </h2>

            {/* Filters */}
            <div className="grid grid-cols-5 items-center gap-6">
                {/* Role */}
                <div className="grid gap-2">
                    <Label htmlFor="role-select">Select Role</Label>
                    <Select
                        onValueChange={setSelectedRole}
                        value={selectedRole || 'all'}
                    >
                        <SelectTrigger
                            id="role-select"
                            className="w-full capitalize"
                        >
                            <SelectValue placeholder="Select role..." />
                        </SelectTrigger>
                        <SelectContent className="capitalize">
                            <SelectItem value="all">All Roles</SelectItem>
                            {ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                    {role.replace(/-/g, ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* User */}
                <div className="grid gap-2">
                    <Label htmlFor="user-select">Select User</Label>
                    <Select
                        onValueChange={setSelectedUser}
                        value={selectedUser}
                        disabled={usersLoading || usersFetching}
                    >
                        <SelectTrigger id="user-select" className="w-full">
                            <SelectValue placeholder="Select user..." />
                        </SelectTrigger>

                        <SelectContent>
                            {usersLoading || usersFetching ? (
                                <div className="space-y-2 p-2">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2"
                                        >
                                            <Skeleton className="h-6 w-6 rounded-full" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-3 w-32" />
                                                <Skeleton className="h-2 w-20" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((u) => (
                                    <SelectItem
                                        key={u._id}
                                        value={
                                            u._id ||
                                            `user-${Math.random()
                                                .toString(36)
                                                .slice(2)}`
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage
                                                    src={u.image || ''}
                                                    alt={u.firstName || 'User'}
                                                />
                                                <AvatarFallback>
                                                    {u.firstName?.[0]?.toUpperCase() ||
                                                        'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">
                                                    {u.firstName} {u.lastName}
                                                </span>
                                                <span className="text-xs text-muted-foreground capitalize">
                                                    {u.role?.replace(/-/g, ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-users" disabled>
                                    No users found
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Country */}
                <div className="grid gap-2">
                    <Label htmlFor="country-select">Country</Label>
                    <Select
                        value={countryFilter}
                        onValueChange={setCountryFilter}
                    >
                        <SelectTrigger id="country-select" className="w-full">
                            <SelectValue placeholder="Country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            {countries?.map((c) => (
                                <SelectItem key={c.name} value={c.name}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Sort */}
                <div className="grid gap-2">
                    <Label htmlFor="sort-select">Sort</Label>
                    <Select
                        value={sort}
                        onValueChange={(val) => setSort(val as SortOption)}
                    >
                        <SelectTrigger id="sort-select" className="w-full">
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
                        </SelectContent>
                    </Select>
                </div>

                {/* Per Page */}
                <div className="grid gap-2">
                    <Label htmlFor="perpage-select">Per Page</Label>
                    <Select
                        value={String(perPage)}
                        onValueChange={(val) => setPerPage(Number(val))}
                    >
                        <SelectTrigger id="perpage-select" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[10, 20, 50, 100].map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                    {n} / page
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            <Table>
                <TableHeader className="bg-muted">
                    <TableRow>
                        <TableHead className="w-12 text-center border">
                            <Checkbox
                                checked={
                                    selectedLeads.length === leads.length &&
                                    leads.length > 0
                                }
                                onCheckedChange={(checked) =>
                                    handleSelectAll(!!checked)
                                }
                                aria-label="Select all leads"
                            />
                        </TableHead>
                        <TableHead className="border">Company</TableHead>
                        <TableHead className="border">Contact Person</TableHead>
                        <TableHead className="border">Emails</TableHead>
                        <TableHead className="border">Phones</TableHead>
                        <TableHead className="border">Designation</TableHead>
                        <TableHead className="border">Address</TableHead>
                        <TableHead className="border">Country</TableHead>
                        <TableHead className="border">Status</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {leadsLoading ? (
                        Array.from({ length: perPage }).map((_, i) => (
                            <TableRow key={i}>
                                {Array.from({ length: 9 }).map((__, j) => (
                                    <TableCell key={j} className="border">
                                        <Skeleton className="h-4 w-24 mx-auto" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : leads.length ? (
                        leads.map((lead: ILead) => (
                            <TableRow key={lead._id}>
                                {/* Checkbox */}
                                <TableCell className="text-center border">
                                    <Checkbox
                                        checked={selectedLeads.includes(
                                            lead._id
                                        )}
                                        onCheckedChange={() =>
                                            handleToggleLead(lead._id)
                                        }
                                        aria-label={`Select ${lead.company.name}`}
                                    />
                                </TableCell>

                                {/* Company */}
                                <TableCell className="border">
                                    <div>
                                        <p className="font-medium">
                                            {lead.company.name}
                                        </p>
                                        {lead.company.website && (
                                            <a
                                                href={
                                                    lead.company.website.startsWith(
                                                        'http'
                                                    )
                                                        ? lead.company.website
                                                        : `https://${lead.company.website}`
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-blue-600 underline break-all"
                                            >
                                                {lead.company.website}
                                            </a>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Contact Person */}
                                <TableCell className="border">
                                    {lead.contactPersons?.length ? (
                                        <div className="space-y-1 text-sm">
                                            {lead.contactPersons.map(
                                                (cp, i) => (
                                                    <div
                                                        key={`cp-${lead._id}-${i}`}
                                                    >
                                                        <p className="font-medium">
                                                            {cp.firstName}{' '}
                                                            {cp.lastName || ''}
                                                        </p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        '-'
                                    )}
                                </TableCell>

                                {/* Emails */}
                                <TableCell className="border text-xs">
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
                                <TableCell className="border text-xs">
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
                                <TableCell className="border">
                                    {lead.contactPersons?.length ? (
                                        <div className="space-y-1 text-sm">
                                            {lead.contactPersons.map(
                                                (cp, i) => (
                                                    <p
                                                        key={`cp-des-${lead._id}-${i}`}
                                                    >
                                                        {cp.designation || '-'}
                                                    </p>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        '-'
                                    )}
                                </TableCell>

                                {/* Address */}
                                <TableCell className="border">
                                    {lead.address || '-'}
                                </TableCell>

                                {/* Country */}
                                <TableCell className="border capitalize">
                                    {lead.country || '-'}
                                </TableCell>

                                {/* Status */}
                                <TableCell className="border">
                                    <span className="capitalize px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                                        {lead.status}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={9}
                                className="text-center py-12 text-muted-foreground border"
                            >
                                No new leads found
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                <div className="text-sm text-muted-foreground">
                    {pagination.totalItems > 0 ? (
                        <>
                            Showing{' '}
                            <span className="font-medium text-foreground">
                                {(page - 1) * perPage + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium text-foreground">
                                {Math.min(
                                    page * perPage,
                                    pagination.totalItems
                                )}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium text-foreground">
                                {pagination.totalItems}
                            </span>{' '}
                            leads
                        </>
                    ) : (
                        <>No leads to display</>
                    )}
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

            {/* Create Task */}
            <div className="pt-4 border-t">
                <Button
                    onClick={handleCreateTask}
                    disabled={
                        creating || !selectedUser || selectedLeads.length === 0
                    }
                    size="lg"
                >
                    {creating ? <Spinner /> : 'Create Task'}
                </Button>
            </div>
        </div>
    );
}
