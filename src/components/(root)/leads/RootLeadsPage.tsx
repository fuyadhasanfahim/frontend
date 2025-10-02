'use client';

import React from 'react';
import ImportLeadsButton from './ImportLeadsButton';

export default function ImportLeadsCard() {
    return (
        <section className="">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Leads Overview</h3>
                <ImportLeadsButton />
            </div>
        </section>
    );
}
