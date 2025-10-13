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

export default function RootTaskPage() {
    const [page, setPage] = useState(1);

    const { data, isLoading } = useGetTasksQuery({ page, limit: 20 });
    const tasks = data?.tasks ?? [];
    const pagination = data?.pagination ?? { totalItems: 0, totalPages: 1 };

    return (
        <div className="p-6 space-y-6 rounded-lg border bg-white">
            <h2 className="text-xl font-semibold">My Tasks</h2>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-accent">
                        <TableRow>
                            <TableHead className="border">Title</TableHead>
                            <TableHead className="border">Type</TableHead>
                            <TableHead className="border">
                                Assigned To
                            </TableHead>
                            <TableHead className="border">Created By</TableHead>
                            <TableHead className="border">Status</TableHead>
                            <TableHead className="border text-center">
                                Progress
                            </TableHead>
                            <TableHead className="border">Created</TableHead>
                            <TableHead className="border">Finished</TableHead>
                            <TableHead className="border">Action</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 20 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 8 }).map((__, j) => (
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
                                    <TableCell className="border text-sm text-muted-foreground text-center">
                                        <Link
                                            href={`tasks/details/${task._id}`}
                                            className="underline"
                                        >
                                            View
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={8}
                                    className="text-center py-12 text-gray-500 border"
                                >
                                    No tasks found
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
                        {(page - 1) * 20 + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium text-gray-900">
                        {Math.min(page * 20, pagination.totalItems)}
                    </span>{' '}
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
