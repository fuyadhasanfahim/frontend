'use client';

import React, {
    useMemo,
    useState,
    useCallback,
    useRef,
    useEffect,
    memo,
} from 'react';
import debounce from 'lodash.debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
    IconDeviceFloppy,
    IconHash,
    IconLoader2,
    IconPlus,
    IconRefresh,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { useBulkCreateLeadsMutation } from '@/redux/features/lead/leadApi';
import { v4 as uuid } from 'uuid';

export type LeadRow = {
    rowId: string;
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

const TagsInput = memo(function TagsInput({
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
        <div className="flex flex-wrap gap-1 items-center min-h-9 px-2 py-1 bg-transparent">
            {value.map((t, i) => (
                <Badge
                    key={i}
                    variant="secondary"
                    className="gap-1 text-xs flex items-center"
                >
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
            <Input
                className="border-0 bg-transparent focus-visible:ring-1 rounded-none h-9 text-sm px-2 shadow-none"
                autoComplete="off"
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
            className="border-0 bg-transparent focus-visible:ring-1 rounded-none h-9 text-sm px-2 shadow-none"
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

export default function RootNewLeadsPage() {
    const [rows, setRows] = useState<LeadRow[]>(() =>
        Array.from({ length: 100 }, () => ({
            rowId: uuid(),
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
    const [bulkCreateLeads, { isLoading }] = useBulkCreateLeadsMutation();

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
            ...Array.from({ length: count }, (_, idx) => ({
                rowId: `${Date.now()}-${idx}`,
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

    const debouncedSave = useMemo(
        () =>
            debounce(async (lead: LeadRow) => {
                try {
                    await bulkCreateLeads({ leads: [lead] }).unwrap();
                    console.log('Saved:', lead.rowId);
                } catch (error) {
                    console.error(error);
                    toast.error('Failed to save lead');
                }
            }, 600),
        [bulkCreateLeads]
    );

    const setCell = useCallback(
        (rowIndex: number, key: string, value: string | string[]) => {
            setRows((rs) =>
                rs.map((r, i) => (i === rowIndex ? { ...r, [key]: value } : r))
            );

            const updatedLead = {
                ...rows[rowIndex],
                [key]: value,
            };

            debouncedSave(updatedLead);
        },
        [rows, debouncedSave]
    );

    const resetTable = useCallback(() => {
        setRows(
            Array.from({ length: 100 }, (_, idx) => ({
                rowId: `${Date.now()}-${idx}`,
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

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startY = useRef(0);
    const scrollLeft = useRef(0);
    const scrollTop = useRef(0);

    const handlePointerDown = (e: React.PointerEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('input, button, textarea, select')) return;

        if (!scrollRef.current) return;
        isDragging.current = true;

        scrollRef.current.setPointerCapture(e.pointerId);

        startX.current = e.pageX;
        startY.current = e.pageY;
        scrollLeft.current = scrollRef.current.scrollLeft;
        scrollTop.current = scrollRef.current.scrollTop;

        scrollRef.current.style.cursor = 'grabbing';
        scrollRef.current.style.userSelect = 'none';
    };

    const handlePointerMove = (e: PointerEvent) => {
        if (!isDragging.current || !scrollRef.current) return;

        e.preventDefault();

        const dx = e.pageX - startX.current;
        const dy = e.pageY - startY.current;

        scrollRef.current.scrollLeft = scrollLeft.current - dx * 1.2;
        scrollRef.current.scrollTop = scrollTop.current - dy * 1.2;
    };

    const handlePointerUp = (e: PointerEvent) => {
        if (!scrollRef.current) return;
        isDragging.current = false;
        scrollRef.current.releasePointerCapture(e.pointerId);

        scrollRef.current.style.cursor = 'grab';
        scrollRef.current.style.userSelect = 'auto';
    };

    useEffect(() => {
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, []);

    return (
        <div className="space-y-4">
            <Card className="overflow-hidden border border-border/60 shadow-sm">
                <CardHeader className="pb-2 flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">
                        Leads Spreadsheet
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="link"
                            onClick={() => addRows(1)}
                        >
                            <IconPlus stroke={2} /> Row
                        </Button>
                        <Button
                            size="sm"
                            variant="link"
                            onClick={() => addRows(100)}
                        >
                            <IconPlus stroke={2} /> 100 Rows
                        </Button>
                        <Button
                            size="sm"
                            variant="link"
                            onClick={() => addColumns(1)}
                        >
                            <IconPlus stroke={2} /> Column
                        </Button>
                        <Button size="sm" variant="link" onClick={resetTable}>
                            <IconRefresh stroke={2} /> Reset
                        </Button>
                        <Button
                            size="sm"
                            variant="link"
                            onClick={() => toast.info('Auto-save is enabled!')}
                        >
                            {!isLoading ? (
                                <IconDeviceFloppy stroke={2} />
                            ) : (
                                <IconLoader2
                                    stroke={2}
                                    className="animate-spin"
                                />
                            )}
                            Save
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <div
                            ref={scrollRef}
                            className="w-full h-[600px] overflow-auto cursor-grab"
                            onPointerDown={handlePointerDown}
                            style={{
                                cursor: isDragging.current
                                    ? 'grabbing'
                                    : 'grab',
                            }}
                        >
                            <div className="inline-block min-w-full">
                                <Table className="w-full">
                                    <TableHeader className="sticky top-0 z-10 bg-muted">
                                        <TableRow>
                                            <TableHead className="w-12 text-center text-muted-foreground">
                                                <IconHash
                                                    strokeWidth={2}
                                                    width={16}
                                                    height={16}
                                                />
                                            </TableHead>
                                            {allColumns.map((col) => (
                                                <TableHead
                                                    key={col.key}
                                                    style={{
                                                        minWidth: col.width,
                                                        width: col.width,
                                                    }}
                                                    className="text-sm font-medium text-muted-foreground"
                                                >
                                                    {col.label}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {rows.map((row, rIdx) => (
                                            <TableRow
                                                key={row.rowId}
                                                className={cn(
                                                    rIdx % 2 === 0
                                                        ? 'bg-muted/20'
                                                        : 'bg-background',
                                                    'hover:bg-accent/40 transition-colors'
                                                )}
                                            >
                                                <TableCell className="text-xs text-muted-foreground text-center w-12">
                                                    {rIdx + 1}
                                                </TableCell>

                                                {allColumns.map((col) => (
                                                    <TableCell
                                                        key={col.key}
                                                        style={{
                                                            minWidth: col.width,
                                                            width: col.width,
                                                        }}
                                                        className="align-middle p-0 border-l"
                                                    >
                                                        {col.type === 'tags' ? (
                                                            <TagsCell
                                                                value={
                                                                    Array.isArray(
                                                                        row[
                                                                            col
                                                                                .key
                                                                        ]
                                                                    )
                                                                        ? (row[
                                                                              col
                                                                                  .key
                                                                          ] as string[])
                                                                        : []
                                                                }
                                                                onChange={(
                                                                    value
                                                                ) =>
                                                                    setCell(
                                                                        rIdx,
                                                                        col.key,
                                                                        value
                                                                    )
                                                                }
                                                                placeholder={
                                                                    col.key ===
                                                                    'emails'
                                                                        ? 'email@domain.com'
                                                                        : '01xxxxxxxxx'
                                                                }
                                                            />
                                                        ) : (
                                                            <TextCell
                                                                value={
                                                                    typeof row[
                                                                        col.key
                                                                    ] ===
                                                                    'string'
                                                                        ? (row[
                                                                              col
                                                                                  .key
                                                                          ] as string)
                                                                        : ''
                                                                }
                                                                onChange={(
                                                                    value
                                                                ) =>
                                                                    setCell(
                                                                        rIdx,
                                                                        col.key,
                                                                        value
                                                                    )
                                                                }
                                                                placeholder={
                                                                    col.label
                                                                }
                                                            />
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">
                Press <kbd>Enter</kbd> or <kbd>,</kbd> to add multiple
                emails/phones. Auto-save is enabled: changes are debounced
                (saves after you pause typing).
            </p>
        </div>
    );
}
