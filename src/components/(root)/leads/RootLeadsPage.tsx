'use client';

import React from 'react';
import ImportLeadsButton from './ImportLeadsButton';
import LeadsTable from './LeadsTable';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';

export default function ImportLeadsCard() {
    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Leads Overview</h3>
                <div className="flex items-center gap-4">
                    <Link
                        href={'/leads/new-leads'}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Button variant="outline" size={'sm'}>
                            <IconPlus />
                            New Leads
                        </Button>
                    </Link>
                    <ImportLeadsButton />
                </div>
            </div>
            <LeadsTable />
        </section>
    );
}
