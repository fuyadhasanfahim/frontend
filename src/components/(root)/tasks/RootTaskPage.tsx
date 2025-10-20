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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetTasksQuery } from '@/redux/features/task/taskApi';
import { formatDistanceToNow } from 'date-fns';
import { ITask } from '@/types/task.interface';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useSignedUser } from '@/hooks/useSignedUser';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { IconPlus } from '@tabler/icons-react';
import { useGetAllUsersQuery } from '@/redux/features/user/userApi';
import { IUser } from '@/types/user.interface';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const roles = [
    'lead-generator',
    'telemarketer',
    'digital-marketer',
    'seo-executive',
    'social-media-executive',
    'web-developer',
    'photo-editor',
    'graphic-designer',
];

export default function RootTaskPage() {
    const { user } = useSignedUser();

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');

    const { data, isLoading, isFetching } = useGetTasksQuery({
        page,
        limit,
        selectedUserId,
    });
    const {
        data: usersData,
        isLoading: usersLoading,
        isFetching: usersFetching,
    } = useGetAllUsersQuery({
        role: selectedRole,
        userId: selectedUserId,
    });

    const tasks = data?.data ?? [];
    const pagination = data?.pagination ?? {
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        limit,
    };

    const start = (pagination.currentPage - 1) * pagination.limit + 1;
    const end = Math.min(
        pagination.currentPage * pagination.limit,
        pagination.totalItems
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {user?.role === 'admin' || user?.role === 'super-admin'
                        ? 'All Tasks'
                        : 'My Tasks'}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="w-full">
                    <div className="flex gap-4 items-center justify-end">
                        {user?.role === 'admin' ||
                            (user?.role === 'super-admin' && (
                                <>
                                    <Select
                                        value={selectedRole}
                                        onValueChange={(val) =>
                                            setSelectedRole(val)
                                        }
                                    >
                                        <SelectTrigger
                                            id="role"
                                            className="capitalize"
                                        >
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((r, i) => (
                                                <SelectItem
                                                    key={i}
                                                    value={r}
                                                    className="capitalize"
                                                >
                                                    {r.replace('-', ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={selectedUserId}
                                        onValueChange={(val) =>
                                            setSelectedUserId(val)
                                        }
                                    >
                                        <SelectTrigger
                                            id="users"
                                            className="capitalize"
                                        >
                                            <SelectValue placeholder="Select user" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All
                                            </SelectItem>
                                            {usersLoading || usersFetching ? (
                                                <div className="space-y-2 p-2">
                                                    {Array.from({
                                                        length: 5,
                                                    }).map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center gap-2 w-full"
                                                        >
                                                            <Skeleton className="h-6 w-6 rounded-full" />
                                                            <div className="space-y-1">
                                                                <Skeleton className="h-3 w-32" />
                                                                <Skeleton className="h-2 w-20" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : usersData?.users?.length > 0 ? (
                                                usersData?.users?.map(
                                                    (u: IUser) => (
                                                        <SelectItem
                                                            key={u._id}
                                                            value={u._id}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarImage
                                                                        src={
                                                                            u.image ||
                                                                            ''
                                                                        }
                                                                        alt={
                                                                            u.firstName ||
                                                                            'User'
                                                                        }
                                                                    />
                                                                    <AvatarFallback>
                                                                        {u.firstName?.[0]?.toUpperCase() ||
                                                                            'U'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium">
                                                                        {
                                                                            u.firstName
                                                                        }{' '}
                                                                        {
                                                                            u.lastName
                                                                        }
                                                                    </span>
                                                                    <span className="text-muted-foreground capitalize">
                                                                        {u.role?.replace(
                                                                            /-/g,
                                                                            ' '
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    )
                                                )
                                            ) : (
                                                <SelectItem
                                                    value="no-users"
                                                    disabled
                                                >
                                                    No users found
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </>
                            ))}

                        <Link
                            href={'/tasks/create-task'}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button variant={'outline'}>
                                <IconPlus />
                                Create Task
                            </Button>
                        </Link>

                        <Select
                            value={String(limit)}
                            onValueChange={(val) => {
                                setPage(1);
                                setLimit(Number(val));
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

                <Table>
                    <TableHeader className="bg-accent">
                        <TableRow>
                            <TableHead className="border">Title</TableHead>
                            <TableHead className="border">Type</TableHead>
                            <TableHead className="border">
                                Assigned To
                            </TableHead>
                            <TableHead className="border">Created By</TableHead>
                            <TableHead className="border">Leads</TableHead>
                            <TableHead className="border">Status</TableHead>
                            <TableHead className="border text-center">
                                Progress
                            </TableHead>
                            <TableHead className="border">Created</TableHead>
                            <TableHead className="border">Finished</TableHead>
                            <TableHead className="border text-center">
                                Action
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading || isFetching ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 10 }).map((__, j) => (
                                        <TableCell key={j} className="border">
                                            <Skeleton className="h-6 w-24" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : tasks.length ? (
                            tasks.map((task: ITask) => (
                                <TableRow key={task._id}>
                                    <TableCell className="border font-medium">
                                        {task.title || 'Untitled'}
                                    </TableCell>
                                    <TableCell className="border capitalize">
                                        {task.type.replace(/_/g, ' ')}
                                    </TableCell>
                                    <TableCell className="border">
                                        {task.assignedTo?.firstName}{' '}
                                        {task.assignedTo?.lastName}
                                    </TableCell>
                                    <TableCell className="border">
                                        {task.createdBy?.firstName}{' '}
                                        {task.createdBy?.lastName}
                                    </TableCell>
                                    <TableCell className="border text-center">
                                        {task.leads?.length ?? 0}
                                    </TableCell>
                                    <TableCell className="border">
                                        <Badge
                                            variant={
                                                task.status === 'completed'
                                                    ? 'secondary'
                                                    : task.status ===
                                                      'in_progress'
                                                    ? 'default'
                                                    : task.status ===
                                                      'cancelled'
                                                    ? 'destructive'
                                                    : 'outline'
                                            }
                                            className={cn(
                                                'capitalize',
                                                task.status === 'completed'
                                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                                    : ''
                                            )}
                                        >
                                            {task.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="border text-center">
                                        {task.progress ?? 0}%
                                    </TableCell>
                                    <TableCell className="border text-sm text-muted-foreground">
                                        {task.createdAt
                                            ? formatDistanceToNow(
                                                  new Date(task.createdAt),
                                                  {
                                                      addSuffix: true,
                                                  }
                                              )
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="border text-sm text-muted-foreground">
                                        {task.finishedAt
                                            ? formatDistanceToNow(
                                                  new Date(task.finishedAt),
                                                  {
                                                      addSuffix: true,
                                                  }
                                              )
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="border text-center">
                                        <Link
                                            href={`/tasks/details/${task._id}`}
                                            className="underline text-sm"
                                        >
                                            View
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={10}
                                    className="text-center py-12 text-gray-500 border"
                                >
                                    No tasks found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <CardFooter className="flex justify-between items-center pt-4">
                <div className="text-sm text-gray-600">
                    Showing{' '}
                    <span className="font-medium text-gray-900">{start}</span>{' '}
                    to <span className="font-medium text-gray-900">{end}</span>{' '}
                    of{' '}
                    <span className="font-medium text-gray-900">
                        {pagination.totalItems}
                    </span>{' '}
                    tasks
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage === 1}
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        className="gap-1"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={
                            pagination.currentPage === pagination.totalPages ||
                            pagination.totalPages === 0
                        }
                        onClick={() =>
                            setPage((p) =>
                                Math.min(p + 1, pagination.totalPages || p + 1)
                            )
                        }
                        className="gap-1"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
