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
import { Skeleton } from '@/components/ui/skeleton';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
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

// ---------- Options ----------
const OUTCOME_OPTIONS = [
    { value: 'connected', label: 'Connected' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'notQualified', label: 'Not Qualified' },
    { value: 'callbackScheduled', label: 'Callback Scheduled' },
    { value: 'needsDecisionMaker', label: 'Needs Decision Maker' },
    { value: 'sendInfo', label: 'Send Information' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'won', label: 'Won' },
    { value: 'lost', label: 'Lost' },
    { value: 'noAnswer', label: 'No Answer' },
    { value: 'voicemailLeft', label: 'Voicemail Left' },
    { value: 'busy', label: 'Busy' },
    { value: 'switchedOff', label: 'Switched Off' },
    { value: 'invalidNumber', label: 'Invalid Number' },
    { value: 'wrongPerson', label: 'Wrong Person' },
    { value: 'dnd', label: 'Do Not Disturb' },
    { value: 'followUpScheduled', label: 'Follow Up Scheduled' },
    { value: 'followUpOverdue', label: 'Follow Up Overdue' },
    { value: 'unreachable', label: 'Unreachable' },
    { value: 'duplicate', label: 'Duplicate' },
    { value: 'archived', label: 'Archived' },
] as const;

const LOST_REASON_OPTIONS = [
    { value: 'noBudget', label: 'No Budget' },
    { value: 'notInterested', label: 'Not Interested' },
    { value: 'timing', label: 'Bad Timing' },
    { value: 'competitor', label: 'Went with Competitor' },
    { value: 'other', label: 'Other' },
] as const;

const CONTACT_CHANNELS = [
    { value: 'phone', label: 'Phone' },
    { value: 'sms', label: 'SMS' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'Email' },
] as const;

// ---------- Component ----------
export default function TaskDetailsPage() {
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
    const [updateTaskWithLead] = useUpdateTaskWithLeadMutation();

    const task: ITask | null = data?.task ?? null;
    const leads: ILead[] = data?.leads ?? [];

    // ---------- Handlers ----------
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
                        nextAction: statusUpdateData.nextAction,
                        dueAt: statusUpdateData.dueAt
                            ? new Date(statusUpdateData.dueAt)
                            : undefined,
                        notes: statusUpdateData.notes,
                        lostReason: statusUpdateData.lostReason,
                        attemptNumber: statusUpdateData.attemptNumber,
                        durationSec: statusUpdateData.durationSec,
                        contactedChannel: statusUpdateData.contactedChannel,
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
        <div className="p-6 space-y-8 rounded-lg border bg-card">
            {/* Task Details */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">{task.title}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p>
                            <strong>Type:</strong> {task.type}
                        </p>
                        <p>
                            <strong>Status:</strong> {task.status}
                        </p>
                        <p>
                            <strong>Progress:</strong> {task.progress ?? 0}%
                        </p>
                    </div>
                    <div>
                        <p>
                            <strong>Assigned To:</strong>{' '}
                            {task.assignedTo?.firstName}{' '}
                            {task.assignedTo?.lastName}
                        </p>
                        <p>
                            <strong>Created By:</strong>{' '}
                            {task.createdBy?.firstName}{' '}
                            {task.createdBy?.lastName}
                        </p>
                        <p>
                            <strong>Created At:</strong>{' '}
                            {format(new Date(task.createdAt), 'PPpp')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Leads Table */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Leads</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Company</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.length ? (
                            leads.map((lead) => (
                                <TableRow key={lead._id}>
                                    <TableCell>{lead.company.name}</TableCell>
                                    <TableCell>{lead.country}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={lead.status}
                                            onValueChange={() =>
                                                handleStatusSelect(lead)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={lead.status}
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[
                                                    'new',
                                                    'contacted',
                                                    'responded',
                                                    'qualified',
                                                    'proposal',
                                                    'won',
                                                    'lost',
                                                    'onHold',
                                                ].map((status) => (
                                                    <SelectItem
                                                        key={status}
                                                        value={status}
                                                    >
                                                        {status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            status.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
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
                                    colSpan={4}
                                    className="text-center py-8 text-muted-foreground"
                                >
                                    No leads found for this task.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog for Activity Details */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Update Lead Status</DialogTitle>
                        <DialogDescription>
                            Provide details for{' '}
                            <strong>{selectedLead?.company.name}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
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
                                <SelectTrigger>
                                    <SelectValue />
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

                        <div className="space-y-2">
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
                                <SelectTrigger>
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

                        {statusUpdateData.outcomeCode === 'lost' && (
                            <div className="col-span-2 space-y-2">
                                <Label>Lost Reason</Label>
                                <Select
                                    value={statusUpdateData.lostReason || ''}
                                    onValueChange={(v) =>
                                        setStatusUpdateData((p) => ({
                                            ...p,
                                            lostReason:
                                                v as IActivity['lostReason'],
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LOST_REASON_OPTIONS.map((r) => (
                                            <SelectItem
                                                key={r.value}
                                                value={r.value}
                                            >
                                                {r.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="col-span-2 space-y-2">
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
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleStatusUpdate}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
