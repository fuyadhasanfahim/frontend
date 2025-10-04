'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- Types ---------------------------------------------------------------
export type LeadRow = {
    companyName: string;
    websiteUrl?: string;
    emails: string[];
    phones: string[];
    address?: string;
    firstName: string;
    lastName: string;
    designation?: string;
    country: string;
    notes?: string;
    [key: string]: string | string[] | undefined;
};

// Core columns configuration
const CORE_COLUMNS = [
    { key: 'companyName', label: 'Company Name', width: 200 },
    { key: 'websiteUrl', label: 'Website', width: 150 },
    { key: 'emails', label: 'Emails', width: 200 },
    { key: 'phones', label: 'Phones', width: 150 },
    { key: 'address', label: 'Address', width: 180 },
    { key: 'firstName', label: 'First Name', width: 120 },
    { key: 'lastName', label: 'Last Name', width: 120 },
    { key: 'designation', label: 'Designation', width: 140 },
    { key: 'country', label: 'Country', width: 120 },
    { key: 'notes', label: 'Notes', width: 200 },
] as const;

// --- Optimized Tags Input -----------------------------------------------
const TagsInput = React.memo(function TagsInput({
    value,
    onChange,
    placeholder,
}: {
    value: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
}) {
    const [draft, setDraft] = useState('');

    const commitDraft = useCallback(() => {
        const v = draft.trim();
        if (!v) return;
        if (!value.includes(v)) {
            onChange([...value, v]);
        }
        setDraft('');
    }, [draft, value, onChange]);

    const removeTag = useCallback(
        (index: number) => {
            onChange(value.filter((_, idx) => idx !== index));
        },
        [value, onChange]
    );

    return (
        <div className="flex flex-wrap gap-1 items-center min-h-9 px-2 py-1 bg-background">
            {value.map((t, i) => (
                <Badge key={i} variant="secondary" className="gap-1 text-xs">
                    {t}
                    <button
                        type="button"
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        onClick={() => removeTag(i)}
                    >
                        ×
                    </button>
                </Badge>
            ))}
            <input
                className="outline-none flex-1 min-w-[8ch] bg-transparent text-sm"
                placeholder={placeholder}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        commitDraft();
                    } else if (
                        e.key === 'Backspace' &&
                        !draft &&
                        value.length
                    ) {
                        onChange(value.slice(0, -1));
                    }
                }}
                onBlur={commitDraft}
            />
        </div>
    );
});

// --- Optimized Cell Components ------------------------------------------
const TextCell = React.memo(function TextCell({
    value,
    onChange,
    placeholder,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="border-0 focus-visible:ring-1 rounded-none h-9 text-sm"
        />
    );
});

const TagsCell = React.memo(function TagsCell({
    value,
    onChange,
    placeholder,
}: {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
}) {
    return (
        <TagsInput
            value={value}
            onChange={onChange}
            placeholder={placeholder}
        />
    );
});

// --- Main Component ------------------------------------------------------
export default function RootNewLeadsPage() {
    const [rows, setRows] = useState<LeadRow[]>(() =>
        Array.from({ length: 100 }, () => ({
            companyName: '',
            websiteUrl: '',
            emails: [],
            phones: [],
            address: '',
            firstName: '',
            lastName: '',
            designation: '',
            country: '',
            notes: '',
        }))
    );

    const [extraCols, setExtraCols] = useState<string[]>([]);

    const allColumns = useMemo(() => {
        return [
            ...CORE_COLUMNS.map((c) => ({
                key: c.key as string,
                label: c.label,
                width: c.width,
                type:
                    c.key === 'emails' || c.key === 'phones'
                        ? 'tags'
                        : ('text' as const),
            })),
            ...extraCols.map((colKey) => ({
                key: colKey,
                label: `Col ${colKey}`,
                width: 150,
                type: 'text' as const,
            })),
        ];
    }, [extraCols]);

    const addRows = useCallback((count = 1) => {
        setRows((r) => [
            ...r,
            ...Array.from({ length: count }, () => ({
                companyName: '',
                websiteUrl: '',
                emails: [],
                phones: [],
                address: '',
                firstName: '',
                lastName: '',
                designation: '',
                country: '',
                notes: '',
            })),
        ]);
    }, []);

    const addColumns = useCallback((count = 1) => {
        setExtraCols((cols) => {
            const start = cols.length;
            const next = [...cols];
            for (let i = 0; i < count; i++) {
                const idx = start + i;
                const name =
                    String.fromCharCode(65 + (idx % 26)) +
                    (idx >= 26 ? Math.floor(idx / 26) : '');
                next.push(`X_${name}`);
            }
            return next;
        });
    }, []);

    const setCell = useCallback(
        (rowIndex: number, key: string, value: string | string[]) => {
            setRows((rs) =>
                rs.map((r, i) => (i === rowIndex ? { ...r, [key]: value } : r))
            );
        },
        []
    );

    const saveAll = useCallback(async () => {
        const leads = rows
            .filter((r) => r.companyName?.trim())
            .map((r) => ({
                companyName: String(r.companyName).trim(),
                websiteUrl: r.websiteUrl || undefined,
                emails: (r.emails || []).map((e) =>
                    String(e).trim().toLowerCase()
                ),
                phones: (r.phones || []).map((p) => String(p).trim()),
                address: r.address || undefined,
                contactPerson: {
                    firstName: String(r.firstName || 'Unknown').trim(),
                    lastName: String(r.lastName || 'Unknown').trim(),
                },
                designation: r.designation || undefined,
                country: String(r.country || '').trim(),
                status: 'new',
                notes: r.notes || undefined,
                extra: Object.fromEntries(
                    Object.entries(r).filter(([k]) => k.startsWith('X_')) as [
                        string,
                        string
                    ][]
                ),
            }));

        try {
            const res = await fetch('/leads/bulk-create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leads }),
            });
            if (!res.ok) throw new Error(await res.text());
            alert('All leads saved successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to save. Check console for details.');
        }
    }, [rows]);

    const resetTable = useCallback(() => {
        setRows(
            Array.from({ length: 100 }, () => ({
                companyName: '',
                websiteUrl: '',
                emails: [],
                phones: [],
                address: '',
                firstName: '',
                lastName: '',
                designation: '',
                country: '',
                notes: '',
            }))
        );
        setExtraCols([]);
    }, []);

    return (
        <div className="p-4 md:p-6 space-y-4">
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Leads Spreadsheet</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                        <Button size="sm" onClick={() => addRows(1)}>
                            + Row
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => addRows(100)}
                        >
                            + 100 Rows
                        </Button>
                        <Button size="sm" onClick={() => addColumns(1)}>
                            + Column
                        </Button>
                        <div className="ml-auto flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={resetTable}
                            >
                                Reset
                            </Button>
                            <Button size="sm" onClick={saveAll}>
                                Save All
                            </Button>
                        </div>
                    </div>

                    {/* Optimized Table with Fixed Header */}
                    <ScrollArea className="h-[600px] border rounded-lg">
                        <div className="relative">
                            {/* Sticky Header */}
                            <div className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
                                <div className="flex border-b">
                                    <div className="sticky left-0 z-20 bg-muted/95 w-12 border-r flex-shrink-0">
                                        <div className="h-12 flex items-center justify-center">
                                            <span className="text-xs text-muted-foreground">
                                                #
                                            </span>
                                        </div>
                                    </div>
                                    {allColumns.map((col) => (
                                        <div
                                            key={col.key}
                                            className="border-r px-3 py-3 text-left"
                                            style={{
                                                minWidth: col.width,
                                                width: col.width,
                                            }}
                                        >
                                            <span className="text-xs font-medium text-muted-foreground">
                                                {col.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Table Body */}
                            <div>
                                {rows.map((row, rIdx) => (
                                    <div
                                        key={rIdx}
                                        className="flex border-b hover:bg-muted/30 transition-colors"
                                    >
                                        {/* Row Number */}
                                        <div className="sticky left-0 z-10 bg-background w-12 border-r flex-shrink-0">
                                            <div className="h-9 flex items-center justify-center">
                                                <span className="text-xs text-muted-foreground">
                                                    {rIdx + 1}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Cells */}
                                        {allColumns.map((col) => (
                                            <div
                                                key={col.key}
                                                className="border-r"
                                                style={{
                                                    minWidth: col.width,
                                                    width: col.width,
                                                }}
                                            >
                                                {col.type === 'tags' ? (
                                                    <TagsCell
                                                        value={
                                                            Array.isArray(
                                                                row[col.key]
                                                            )
                                                                ? (row[
                                                                      col.key
                                                                  ] as string[])
                                                                : []
                                                        }
                                                        onChange={(value) =>
                                                            setCell(
                                                                rIdx,
                                                                col.key,
                                                                value
                                                            )
                                                        }
                                                        placeholder={
                                                            col.key === 'emails'
                                                                ? 'email@domain.com'
                                                                : '01xxxxxxxxx'
                                                        }
                                                    />
                                                ) : (
                                                    <TextCell
                                                        value={
                                                            typeof row[
                                                                col.key
                                                            ] === 'string'
                                                                ? (row[
                                                                      col.key
                                                                  ] as string)
                                                                : ''
                                                        }
                                                        onChange={(value) =>
                                                            setCell(
                                                                rIdx,
                                                                col.key,
                                                                value
                                                            )
                                                        }
                                                        placeholder={col.label}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground">
                Tips: Optimized for performance with 100+ rows. Use &quot;+ 100
                Rows&quot; to quickly add more. Multiple emails and phones can
                be added by pressing Enter or comma.
            </p>
        </div>
    );
}
