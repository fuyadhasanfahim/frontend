'use client';

import React from 'react';
import ImportLeadsButton from './ImportLeadsButton';
import LeadsTable from './LeadsTable';
import { Button } from '@/components/ui/button';
import { IconPlus, IconUserPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { useSignedUser } from '@/hooks/useSignedUser';

export default function ImportLeadsCard() {
    const { user } = useSignedUser();

    const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Leads Overview</h3>
                <div className="flex items-center gap-6">
                    {isAdmin && (
                        <Link href={'/leads/assign-telemarketer'}>
                            <Button variant="outline">
                                <IconUserPlus />
                                Assign Telemarketer
                            </Button>
                        </Link>
                    )}
                    <Link
                        href={'/leads/new-leads'}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Button variant="secondary">
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
