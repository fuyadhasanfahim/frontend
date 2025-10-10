'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeadForm from './LeadForm';
import CollectedLeads from './CollectedLeads';
import { Badge } from '@/components/ui/badge';

export default function RootNewLeadsPage() {
    const [collectedLeadsCount, setCollectedLeadsCount] = useState<number>(0);

    return (
        <div>
            <Tabs defaultValue="lead-form">
                <TabsList className="bg-white/50 backdrop-blur-2xl rounded-md shadow">
                    <TabsTrigger value="lead-form">Add Lead</TabsTrigger>
                    <TabsTrigger value="collected-leads">
                        Collected Leads{' '}
                        <Badge variant={'secondary'}>
                            {collectedLeadsCount}
                        </Badge>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="lead-form">
                    <LeadForm />
                </TabsContent>
                <TabsContent value="collected-leads">
                    <CollectedLeads setCollectedLeadsCount={setCollectedLeadsCount} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
