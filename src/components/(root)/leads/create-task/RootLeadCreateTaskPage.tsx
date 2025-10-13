/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useGetCountriesQuery } from '@/redux/features/country/countryApi';
import { useGetLeadsQuery } from '@/redux/features/lead/leadApi';
import { useCreateTaskMutation } from '@/redux/features/task/taskApi';
import { useGetAllUsersQuery } from '@/redux/features/user/userApi';
import { useSignedUser } from '@/hooks/useSignedUser';
import { Skeleton } from '@/components/ui/skeleton';
import { ILead } from '@/types/lead.interface';
import { toast } from 'sonner';

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

type SortOption = 'companyAsc' | 'companyDesc' | 'countryAsc' | 'countryDesc';

export default function RootLeadCreateTaskPage() {
    const { user, isLoading: userLoading } = useSignedUser();
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [sort, setSort] = useState<SortOption>('companyAsc');

    const { data: countries } = useGetCountriesQuery({});
    const { data: usersData } = useGetAllUsersQuery(undefined);

    const { data, isLoading: leadsLoading } = useGetLeadsQuery({
        page,
        limit: perPage,
        country: countryFilter,
        sortBy: sort.includes('company') ? 'company.name' : 'country',
        sortOrder: sort.endsWith('Asc') ? 'asc' : 'desc',
        status: 'new',
    });

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
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to create task');
        }
    };

    const filteredUsers = useMemo(() => {
        if (!usersData?.users) return [];
        if (!selectedRole)
            return usersData.users.filter((u: any) => u._id !== user?._id);
        return usersData.users.filter(
            (u: any) => u.role === selectedRole && u._id !== user?._id
        );
    }, [usersData, selectedRole, user?._id]);

    if (userLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner className="w-8 h-8" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 rounded-lg border bg-card">
            <h2 className="text-xl font-semibold">
                Create Lead Generation Task
            </h2>

            {/* Inline Filters */}
            <div className="grid grid-cols-5 items-center gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="role-select">Select Role</Label>
                    <Select
                        onValueChange={setSelectedRole}
                        value={selectedRole}
                    >
                        <SelectTrigger
                            id="role-select"
                            className="w-full capitalize"
                        >
                            <SelectValue
                                placeholder="Select role..."
                                className=""
                            />
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

                {/* User (always visible) */}
                <div className="grid gap-2">
                    <Label htmlFor="user-select">Select User</Label>
                    <Select
                        onValueChange={setSelectedUser}
                        value={selectedUser}
                    >
                        <SelectTrigger id="user-select" className="w-full">
                            <SelectValue placeholder="Select user..." />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((u: any) => (
                                    <SelectItem key={u._id} value={u._id}>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage
                                                    src={u.image || ''}
                                                    alt={
                                                        u.name || 'User avatar'
                                                    }
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
                            <SelectValue
                                placeholder="Country"
                                className="capitalize"
                            />
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
                        <TableHead className="border">Website</TableHead>
                        <TableHead className="border">Country</TableHead>
                        <TableHead className="border">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leadsLoading ? (
                        Array.from({ length: perPage }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell className="border">
                                    <Skeleton className="h-4 w-4 mx-auto" />
                                </TableCell>
                                <TableCell className="border">
                                    <Skeleton className="h-4 w-32" />
                                </TableCell>
                                <TableCell className="border">
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                                <TableCell className="border">
                                    <Skeleton className="h-4 w-20" />
                                </TableCell>
                                <TableCell className="border">
                                    <Skeleton className="h-4 w-16" />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : leads.length ? (
                        leads.map((lead: ILead) => (
                            <TableRow key={lead._id}>
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
                                <TableCell className="font-medium border">
                                    {lead.company.name}
                                </TableCell>
                                <TableCell className="text-muted-foreground border">
                                    {lead.company.website}
                                </TableCell>
                                <TableCell className="capitalize border">
                                    {lead.country}
                                </TableCell>
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
                                colSpan={5}
                                className="text-center py-12 text-muted-foreground"
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
                    Showing{' '}
                    <span className="font-medium text-foreground">
                        {(page - 1) * perPage + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium text-foreground">
                        {Math.min(page * perPage, pagination.totalItems)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-foreground">
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
