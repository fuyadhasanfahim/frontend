'use client';

import React, { useState } from 'react';
import {
    useAssignTelemarketerMutation,
    useGetLeadsQuery,
} from '@/redux/features/lead/leadApi';
import { useGetAllUsersQuery } from '@/redux/features/user/userApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { IUser } from '@/types/user.interface';
import { ILead } from '@/types/lead.interface';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { CalendarWithTime } from './CalendarWithTimeProps';

export default function RootAssignTelemarketerPage() {
    const [selectedUser, setSelectedUser] = useState<string | undefined>(
        undefined
    );
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [deadline, setDeadline] = useState<Date | undefined>(undefined);

    const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery(
        {}
    );
    const users = usersData?.users?.filter(
        (user: IUser) => user.role === 'telemarketer'
    );

    const { data: leadsData, isLoading: leadsLoading } = useGetLeadsQuery({
        page: 1,
        limit: 20,
    });

    const toggleLead = (id: string) => {
        setSelectedLeads((prev) =>
            prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
        );
    };

    const [assignTelemarketer, { isLoading: assigning }] =
        useAssignTelemarketerMutation();

    const handleCreateTask = async () => {
        if (!selectedUser || selectedLeads.length === 0 || !deadline) {
            toast.warning('Please select telemarketer, leads, and deadline');
            return;
        }

        try {
            const res = await assignTelemarketer({
                telemarketerId: selectedUser,
                leads: selectedLeads,
                deadline,
                totalTarget: selectedLeads.length, // optional, you can change
            }).unwrap();

            toast.success('Leads assigned successfully');
            console.log('Assignment created:', res);
            setSelectedLeads([]);
            setSelectedUser(undefined);
            setDeadline(undefined);
        } catch (err) {
            toast.error((err as Error).message || 'Failed to assign leads');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Lead Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Telemarketer Select */}
                <div>
                    <h3 className="mb-2 text-sm font-medium">
                        Assign Telemarketer
                    </h3>
                    {usersLoading ? (
                        <p>Loading users...</p>
                    ) : (
                        <Select onValueChange={setSelectedUser}>
                            <SelectTrigger className="w-[240px]">
                                <SelectValue placeholder="Select a telemarketer" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((u: IUser) => (
                                    <SelectItem key={u._id} value={u._id}>
                                        {u.firstName} {u.lastName} ({u.role})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {/* Deadline Picker */}
                <div>
                    <h3 className="mb-2 text-sm font-medium">Set Deadline</h3>
                    <CalendarWithTime value={deadline} onChange={setDeadline} />
                </div>

                {/* Leads Table */}
                <div>
                    <h3 className="mb-2 text-sm font-medium">Select Leads</h3>
                    {leadsLoading ? (
                        <p>Loading leads...</p>
                    ) : (
                        <div className="max-h-[300px] overflow-y-auto border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Assign</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Phone</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leadsData?.data?.map((lead: ILead) => (
                                        <TableRow key={lead._id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLeads.includes(
                                                        lead._id
                                                    )}
                                                    onChange={() =>
                                                        toggleLead(lead._id)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {lead.companyName}
                                            </TableCell>
                                            <TableCell>
                                                {lead.emails?.join(', ')}
                                            </TableCell>
                                            <TableCell>
                                                {lead.phones?.join(', ')}
                                            </TableCell>
                                            <TableCell>{lead.status}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleCreateTask}
                        disabled={
                            !selectedUser ||
                            selectedLeads.length === 0 ||
                            !deadline ||
                            assigning
                        }
                    >
                        {assigning ? <Spinner /> : 'Create Assignment'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
