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

export default function RootTaskPage() {
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data, isLoading } = useGetTasksQuery({ page, limit });

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
                <CardTitle>My Tasks</CardTitle>
            </CardHeader>

            <CardContent className="overflow-x-auto">
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
                            <TableHead className="border text-center">
                                Action
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 10 }).map((_, i) => (
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
                                    colSpan={9}
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
