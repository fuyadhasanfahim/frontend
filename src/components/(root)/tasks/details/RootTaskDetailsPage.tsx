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
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import {
    useGetTaskByIdQuery,
    useUpdateTaskWithLeadMutation,
} from '@/redux/features/task/taskApi';
import { ITask } from '@/types/task.interface';
import { ILead, IActivity } from '@/types/lead.interface';
import { useSignedUser } from '@/hooks/useSignedUser';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

// ---------- Constants ----------
const OUTCOME_OPTIONS: readonly {
    value: IActivity['outcomeCode'];
    label: string;
}[] = [
    { value: 'connected', label: 'Connected' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'notQualified', label: 'Not Qualified' },
    { value: 'callbackScheduled', label: 'Callback Scheduled' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
    { value: 'noAnswer', label: 'No Answer' },
    { value: 'unreachable', label: 'Unreachable' },
];

const CONTACT_CHANNELS: readonly {
    value: NonNullable<IActivity['contactedChannel']>;
    label: string;
}[] = [
    { value: 'phone', label: 'Phone' },
    { value: 'sms', label: 'SMS' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'Email' },
];

// ---------- Component ----------
export default function RootTaskDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useSignedUser();

    const [selectedLead, setSelectedLead] = useState<ILead | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [statusUpdateData, setStatusUpdateData] = useState<
        Partial<IActivity>
    >({
        outcomeCode: 'connected',
        attemptNumber: 1,
    });

    const { data, isLoading } = useGetTaskByIdQuery(id, { skip: !id });
    const [updateTaskWithLead, { isLoading: isUpdating }] =
        useUpdateTaskWithLeadMutation();

    const task: ITask | null = data?.task ?? null;
    const leads: ILead[] = data?.leads ?? [];

    // ---------- Logic ----------
    const getStatusFromOutcome = (
        outcomeCode: IActivity['outcomeCode']
    ): ILead['status'] => {
        const map: Record<IActivity['outcomeCode'], ILead['status']> = {
            connected: 'contacted',
            qualified: 'qualified',
            notQualified: 'contacted',
            callbackScheduled: 'contacted',
            needsDecisionMaker: 'contacted',
            sendInfo: 'contacted',
            negotiation: 'proposal',
            won: 'won',
            lost: 'lost',
            noAnswer: 'contacted',
            voicemailLeft: 'contacted',
            busy: 'contacted',
            switchedOff: 'contacted',
            invalidNumber: 'contacted',
            wrongPerson: 'contacted',
            dnd: 'contacted',
            followUpScheduled: 'contacted',
            followUpOverdue: 'contacted',
            unreachable: 'contacted',
            duplicate: 'onHold',
            archived: 'onHold',
        };
        return map[outcomeCode] || 'contacted';
    };

    const handleStatusSelect = (lead: ILead) => {
        setSelectedLead(lead);
        setStatusUpdateData({ outcomeCode: 'connected', attemptNumber: 1 });
        setIsDialogOpen(true);
    };

    const handleStatusUpdate = async () => {
        if (!selectedLead || !task) return;

        try {
            const newStatus = getStatusFromOutcome(
                statusUpdateData.outcomeCode!
            );
            const newDone = (task.metrics?.done ?? 0) + 1;
            const total = task.metrics?.total ?? 1;
            const progress = Math.min(100, Math.round((newDone / total) * 100));

            await updateTaskWithLead({
                taskId: task._id,
                leadId: selectedLead._id,
                body: {
                    taskUpdates: {
                        metrics: { done: newDone, total },
                        progress,
                        ...(progress === 100 ? { status: 'completed' } : {}),
                    },
                    leadUpdates: { status: newStatus },
                    activity: {
                        type: 'statusChange',
                        outcomeCode: statusUpdateData.outcomeCode!,
                        contactedChannel: statusUpdateData.contactedChannel,
                        notes: statusUpdateData.notes,
                        byUser: user?._id as string,
                        at: new Date(),
                        statusFrom: selectedLead.status,
                        statusTo: newStatus,
                    },
                },
            }).unwrap();

            toast.success('Lead and task updated successfully!');
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update lead and task.');
        }
    };

    // ---------- Render ----------
    if (isLoading)
        return (
            <div className="p-6 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );

    if (!task)
        return <div className="p-6 text-muted-foreground">Task not found.</div>;

    return (
        <div className="space-y-6">
            {/* 🟦 Task Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Task Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm p-4">
                    <div className="space-y-2">
                        <p>
                            <strong>Title:</strong> {task.title}
                        </p>
                        <p>
                            <strong>Type:</strong> {task.type}
                        </p>
                        <p>
                            <strong>Status:</strong>
                            <Badge className="ml-2 capitalize">
                                {task.status}
                            </Badge>
                        </p>
                        <p>
                            <strong>Progress:</strong> {task.progress ?? 0}%
                        </p>
                    </div>
                    <div className="space-y-4">
                        {/* Assigned To */}
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage
                                    src={task.assignedTo?.image || ''}
                                />
                                <AvatarFallback>
                                    {task.assignedTo?.firstName?.[0]}
                                    {task.assignedTo?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-sm">
                                    Assigned To
                                </p>
                                <p className="text-sm text-gray-700">
                                    {task.assignedTo?.firstName}{' '}
                                    {task.assignedTo?.lastName}
                                </p>
                            </div>
                        </div>

                        {/* Created By */}
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage
                                    src={task.createdBy?.image || ''}
                                />
                                <AvatarFallback>
                                    {task.createdBy?.firstName?.[0]}
                                    {task.createdBy?.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium text-sm">
                                    Created By
                                </p>
                                <p className="text-sm text-gray-700">
                                    {task.createdBy?.firstName}{' '}
                                    {task.createdBy?.lastName}
                                </p>
                            </div>
                        </div>

                        {/* Dates */}
                        <div className="text-sm space-y-1">
                            <p>
                                <strong>Created At:</strong>{' '}
                                {format(new Date(task.createdAt), 'PPP')}
                            </p>
                            {task.finishedAt && (
                                <p>
                                    <strong>Finished At:</strong>{' '}
                                    {format(new Date(task.finishedAt), 'PPP')}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 🟨 Leads Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Leads ({leads.length})</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-accent">
                            <TableRow>
                                <TableHead className="border">
                                    Company
                                </TableHead>
                                <TableHead className="border">
                                    Contact Person
                                </TableHead>
                                <TableHead className="border">Emails</TableHead>
                                <TableHead className="border">Phones</TableHead>
                                <TableHead className="border">
                                    Designation
                                </TableHead>
                                <TableHead className="border">
                                    Address
                                </TableHead>
                                <TableHead className="border">
                                    Country
                                </TableHead>
                                <TableHead className="border">Status</TableHead>
                                <TableHead className="border text-center">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leads.length ? (
                                leads.map((lead) => (
                                    <TableRow key={lead._id}>
                                        <TableCell className="border">
                                            <p className="font-medium">
                                                {lead.company.name}
                                            </p>
                                            {lead.company.website && (
                                                <a
                                                    href={lead.company.website}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-600 text-xs underline"
                                                >
                                                    {lead.company.website}
                                                </a>
                                            )}
                                        </TableCell>
                                        <TableCell className="border">
                                            {lead.contactPersons.length > 0
                                                ? lead.contactPersons.map(
                                                      (cp, i) => (
                                                          <p key={i}>
                                                              {cp.firstName}{' '}
                                                              {cp.lastName}
                                                          </p>
                                                      )
                                                  )
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="border text-xs">
                                            {lead.contactPersons?.flatMap(
                                                (cp, cpIndex) =>
                                                    cp.emails?.map(
                                                        (e, emailIndex) => (
                                                            <p
                                                                key={`cp-${cpIndex}-email-${emailIndex}`}
                                                            >
                                                                {e}
                                                            </p>
                                                        )
                                                    )
                                            )}
                                        </TableCell>
                                        <TableCell className="border text-xs">
                                            {lead.contactPersons?.flatMap(
                                                (cp, cpIndex) =>
                                                    cp.phones?.map(
                                                        (p, phoneIndex) => (
                                                            <p
                                                                key={`cp-${cpIndex}-phone-${phoneIndex}`}
                                                            >
                                                                {p}
                                                            </p>
                                                        )
                                                    )
                                            )}
                                        </TableCell>
                                        <TableCell className="border">
                                            {lead.contactPersons.length > 0
                                                ? lead.contactPersons.map(
                                                      (cp, i) => (
                                                          <p
                                                              key={`cp-des-${i}`}
                                                          >
                                                              {cp.designation ||
                                                                  '-'}
                                                          </p>
                                                      )
                                                  )
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="border">
                                            {lead.address || '-'}
                                        </TableCell>
                                        <TableCell className="border capitalize">
                                            {lead.country}
                                        </TableCell>
                                        <TableCell className="border capitalize">
                                            <Badge variant="outline">
                                                {lead.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="border text-center">
                                            <Button
                                                size="sm"
                                                variant="link"
                                                onClick={() =>
                                                    handleStatusSelect(lead)
                                                }
                                            >
                                                Update
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="text-center py-10 text-gray-500 border"
                                    >
                                        No leads found for this task.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* 🧩 Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Update Lead Status</DialogTitle>
                        <DialogDescription>
                            Provide details for{' '}
                            <strong>{selectedLead?.company.name}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        className="grid grid-cols-2 gap-4 pt-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleStatusUpdate();
                        }}
                    >
                        {/* Outcome */}
                        <div className="space-y-3">
                            <Label>Outcome *</Label>
                            <Select
                                value={
                                    statusUpdateData.outcomeCode || 'connected'
                                }
                                onValueChange={(v) =>
                                    setStatusUpdateData((p) => ({
                                        ...p,
                                        outcomeCode:
                                            v as IActivity['outcomeCode'],
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select outcome" />
                                </SelectTrigger>
                                <SelectContent>
                                    {OUTCOME_OPTIONS.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Contact Channel */}
                        <div className="space-y-3">
                            <Label>Contact Channel</Label>
                            <Select
                                value={statusUpdateData.contactedChannel || ''}
                                onValueChange={(v) =>
                                    setStatusUpdateData((p) => ({
                                        ...p,
                                        contactedChannel:
                                            v as IActivity['contactedChannel'],
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select channel" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CONTACT_CHANNELS.map((c) => (
                                        <SelectItem
                                            key={c.value}
                                            value={c.value}
                                        >
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Notes */}
                        <div className="col-span-2 space-y-3">
                            <Label>Notes</Label>
                            <Textarea
                                rows={3}
                                placeholder="Add notes about this interaction..."
                                value={statusUpdateData.notes || ''}
                                onChange={(e) =>
                                    setStatusUpdateData((p) => ({
                                        ...p,
                                        notes: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        {/* Footer inside form */}
                        <DialogFooter className="col-span-2 mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? <Spinner /> : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
