'use client';

import React, { useState } from 'react';
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import LeadsTable from './LeadsTable';

export const OUTCOME_LABELS: Record<IActivity['outcomeCode'], string> = {
    interestedInfo: 'Interested - Wants More Info',
    interestedQuotation: 'Interested - Wants Quotation',
    noAnswer: 'No Answer / Missed',
    notInterestedNow: 'Not Interested (Future Potential)',
    invalidNumber: 'Invalid / Wrong Number',
    existingClientFollowUp: 'Existing Client Follow-Up',
    systemUpdate: 'System Update',
};

const CONTACT_CHANNELS: readonly {
    value: NonNullable<IActivity['contactedChannel']>;
    label: string;
}[] = [
    { value: 'phone', label: 'Phone' },
    { value: 'sms', label: 'SMS' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'Email' },
];

export default function RootTaskDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { user } = useSignedUser();

    const [selectedLead, setSelectedLead] = useState<ILead | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [statusUpdateData, setStatusUpdateData] = useState<
        Partial<IActivity>
    >({
        outcomeCode: undefined,
        attemptNumber: 1,
        dueAt: new Date(),
    });
    const [open, setOpen] = useState(false);

    const { data, isLoading, isFetching } = useGetTaskByIdQuery(id, {
        skip: !id,
    });
    const [updateTaskWithLead, { isLoading: isUpdating }] =
        useUpdateTaskWithLeadMutation();

    const task: ITask | null = data?.task ?? null;
    const leads: ILead[] = data?.leads ?? [];

    const getStatusFromOutcome = (
        outcomeCode: IActivity['outcomeCode']
    ): ILead['status'] => {
        const map: Record<IActivity['outcomeCode'], ILead['status']> = {
            interestedInfo: 'responded',
            interestedQuotation: 'qualified',
            noAnswer: 'contacted',
            notInterestedNow: 'onHold',
            invalidNumber: 'onHold',
            existingClientFollowUp: 'contacted',
            systemUpdate: 'new',
        };

        return map[outcomeCode] || 'contacted';
    };

    const handleStatusSelect = (lead: ILead) => {
        setSelectedLead(lead);
        setStatusUpdateData({
            outcomeCode: undefined,
            attemptNumber: (lead.activities?.length ?? 0) + 1,
        });
        setIsDialogOpen(true);
    };

    const handleStatusUpdate = async () => {
        if (!selectedLead || !task || !statusUpdateData.outcomeCode) return;

        try {
            const newStatus = getStatusFromOutcome(
                statusUpdateData.outcomeCode
            );

            // Don't calculate progress on frontend - let backend handle it
            await updateTaskWithLead({
                taskId: task._id,
                leadId: selectedLead._id,
                body: {
                    // Remove taskUpdates from frontend calculation
                    // Let backend handle the progress calculation
                    leadUpdates: { status: newStatus },
                    activity: {
                        type: 'call',
                        outcomeCode: statusUpdateData.outcomeCode,
                        contactedChannel: statusUpdateData.contactedChannel,
                        notes: statusUpdateData.notes,
                        byUser: user?._id as string,
                        at: new Date(),
                        attemptNumber: statusUpdateData.attemptNumber ?? 1,
                        statusFrom: selectedLead.status,
                        statusTo: newStatus,
                    },
                },
            }).unwrap();

            toast.success('Lead and task updated successfully!');
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
            const errorMessage =
                (error as Error).message || 'Failed to update lead and task.';
            toast.error(errorMessage);
        }
    };

    if (isLoading || isFetching)
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

                        <div className="text-sm space-y-1">
                            <p>
                                <strong>Created At:</strong>{' '}
                                {format(task.createdAt, 'PPP')}
                            </p>
                            {task.finishedAt && (
                                <p>
                                    <strong>Finished At:</strong>{' '}
                                    {format(task.finishedAt, 'PPP')}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Leads ({leads.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <LeadsTable
                        leads={leads}
                        handleStatusSelect={handleStatusSelect}
                    />
                </CardContent>
            </Card>

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
                        {/* 🟢 Outcome */}
                        <div className="space-y-3">
                            <Label>Outcome *</Label>
                            <Select
                                value={statusUpdateData.outcomeCode || ''}
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
                                    {Object.entries(OUTCOME_LABELS).map(
                                        ([value, label]) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 🟠 Contact Channel */}
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

                        {/* 🧭 Next Action */}
                        <div className="space-y-3">
                            <Label>Next Action</Label>
                            <Select
                                value={statusUpdateData.nextAction || ''}
                                onValueChange={(v) =>
                                    setStatusUpdateData((p) => ({
                                        ...p,
                                        nextAction:
                                            v as IActivity['nextAction'],
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select next action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sendProposal">
                                        Send Proposal
                                    </SelectItem>
                                    <SelectItem value="followUp">
                                        Follow Up
                                    </SelectItem>
                                    <SelectItem value="retry">Retry</SelectItem>
                                    <SelectItem value="enrichContact">
                                        Enrich Contact
                                    </SelectItem>
                                    <SelectItem value="scheduleMeeting">
                                        Schedule Meeting
                                    </SelectItem>
                                    <SelectItem value="closeLost">
                                        Close as Lost
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label htmlFor="dueAt" className="px-1">
                                Follow-up Date
                            </Label>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        id="dueAt"
                                        className="w-auto justify-between font-normal"
                                    >
                                        {statusUpdateData.dueAt
                                            ? format(
                                                  statusUpdateData.dueAt,
                                                  'PPP'
                                              )
                                            : 'Select date'}
                                        <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto overflow-hidden p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={statusUpdateData.dueAt}
                                        captionLayout="dropdown"
                                        onSelect={(date) => {
                                            setStatusUpdateData((p) => ({
                                                ...p,
                                                dueAt: date,
                                            }));
                                            setOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* 💬 Duration */}
                        <div className="space-y-3">
                            <Label>Call Duration (seconds)</Label>
                            <input
                                type="text"
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                placeholder="e.g., 180"
                                value={statusUpdateData.durationSec || ''}
                                onChange={(e) =>
                                    setStatusUpdateData((p) => ({
                                        ...p,
                                        durationSec: Number(e.target.value),
                                    }))
                                }
                            />
                        </div>

                        {/* 🔢 Attempt Number */}
                        <div className="space-y-3">
                            <Label>Attempt #</Label>
                            <input
                                type="text"
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                value={statusUpdateData.attemptNumber || 1}
                                onChange={(e) =>
                                    setStatusUpdateData((p) => ({
                                        ...p,
                                        attemptNumber: Number(e.target.value),
                                    }))
                                }
                            />
                        </div>

                        {/* 🚫 Lost Reason (only when outcome = notInterestedNow) */}
                        {statusUpdateData.outcomeCode ===
                            'notInterestedNow' && (
                            <div className="col-span-2 space-y-3">
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
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select reason" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="noBudget">
                                            No Budget
                                        </SelectItem>
                                        <SelectItem value="notInterested">
                                            Not Interested
                                        </SelectItem>
                                        <SelectItem value="timing">
                                            Bad Timing
                                        </SelectItem>
                                        <SelectItem value="competitor">
                                            Chose Competitor
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* 📝 Notes */}
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
