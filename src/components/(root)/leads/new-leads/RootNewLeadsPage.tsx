'use client';

import React, { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeadForm from './LeadForm';
import CollectedLeads from './CollectedLeads';
import { Badge } from '@/components/ui/badge';
import { useGetLeadsByDateQuery } from '@/redux/features/lead/leadApi';
import { format } from 'date-fns';

export default function RootNewLeadsPage() {
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [date, setDate] = useState<Date | undefined>(new Date());

    const queryParams = useMemo(
        () => ({
            page,
            limit: perPage,
            date:
                date instanceof Date && !isNaN(date.getTime())
                    ? format(date, 'yyyy-MM-dd')
                    : undefined,
        }),
        [page, perPage, date]
    );

    const { data, isLoading, isError } = useGetLeadsByDateQuery(queryParams);

    return (
        <div>
            <Tabs defaultValue="lead-form">
                <TabsList className="bg-white/50 backdrop-blur-2xl rounded-md shadow">
                    <TabsTrigger value="lead-form">Add Lead</TabsTrigger>
                    <TabsTrigger value="collected-leads">
                        Collected Leads{' '}
                        <Badge variant={'secondary'}>
                            {data?.pagination.totalItems ?? 0}
                        </Badge>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="lead-form">
                    <LeadForm />
                </TabsContent>
                <TabsContent value="collected-leads">
                    <CollectedLeads
                        isLoading={isLoading}
                        isError={isError}
                        leads={data?.data ?? []}
                        pagination={
                            data?.pagination ?? { totalItems: 0, totalPages: 1 }
                        }
                        setPage={setPage}
                        setPerPage={setPerPage}
                        setDate={setDate}
                        date={date}
                        perPage={perPage}
                        page={page}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
