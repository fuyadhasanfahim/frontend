'use client';

import React, { useState } from 'react';
import { useGetLeadsQuery } from '@/redux/features/lead/leadApi';
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
import { CalendarIcon } from 'lucide-react';
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { ILeadAssignment } from '@/types/lead-assignment.interface';

export default function UserLeadsPage() {
    const [selectedUser, setSelectedUser] = useState<string | undefined>(
        undefined
    );
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [deadline, setDeadline] = useState<Date | undefined>(undefined);

    const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery(
        {}
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

    const handleCreateTask = () => {
        if (!selectedUser || selectedLeads.length === 0 || !deadline) {
            alert('Please select telemarketer, leads, and deadline');
            return;
        }

        const assignment: Partial<ILeadAssignment> = {
            telemarketer: selectedUser as any,
            assignedBy: 'currentAdminId' as any,
            leads: selectedLeads as any,
            totalTarget: selectedLeads.length,
            deadline,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            completedCount: 0,
            completedLeads: [],
        };

        console.log('Assignment payload:', assignment);
        // TODO: call mutation to save in backend
    };

    return (
        <div className="p-6">
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
                                    {usersData?.users.map((u: any) => (
                                        <SelectItem key={u._id} value={u._id}>
                                            {u.firstName} {u.lastName} ({u.role}
                                            )
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Deadline Picker */}
                    <div>
                        <h3 className="mb-2 text-sm font-medium">
                            Set Deadline
                        </h3>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-[240px] justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {deadline ? (
                                        format(deadline, 'PPP')
                                    ) : (
                                        <span>Pick deadline</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={deadline}
                                    onSelect={setDeadline}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Leads Table */}
                    <div>
                        <h3 className="mb-2 text-sm font-medium">
                            Select Leads
                        </h3>
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
                                        {leadsData?.data?.map((lead: any) => (
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
                                                <TableCell>
                                                    {lead.status}
                                                </TableCell>
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
                            className="bg-blue-600 text-white"
                            onClick={handleCreateTask}
                            disabled={
                                !selectedUser ||
                                selectedLeads.length === 0 ||
                                !deadline
                            }
                        >
                            Create Assignment
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
