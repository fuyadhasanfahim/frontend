'use client';

import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useImportLeadsMutation } from '@/redux/features/lead/leadApi';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    IconLoader2,
    IconFileSpreadsheet,
    IconX,
    IconCheck,
    IconCircleDot,
    IconDatabaseImport,
    IconAlertTriangle,
} from '@tabler/icons-react';
import { getClientSocket } from '@/lib/clientSocket';

type ProgressPayload = {
    total: number;
    processed: number;
    percentage: number;
    inserted: number;
    duplicates: number;
    errors: number;
    remaining: number;
    stage?: 'parsing' | 'deduping' | 'inserting' | 'done';
};

export default function ImportLeadsButton() {
    const [open, setOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [rowsToShow, setRowsToShow] = useState<number | 'all'>('all');

    const [uploadId, setUploadId] = useState<string | null>(null);
    const [progress, setProgress] = useState<ProgressPayload | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const [importLeads, { isLoading }] = useImportLeadsMutation();

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (accepted) => setFiles(accepted),
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                ['.xlsx'],
        },
        multiple: false,
    });

    // Subscribe to socket when uploadId is available
    useEffect(() => {
        if (!uploadId) return;

        const socket = getClientSocket();

        const onConnect = () => {
            socket.emit('import:subscribe', { uploadId });
        };

        const onSubscribed = () => setIsSubscribed(true);

        const onProgress = (p: ProgressPayload) => {
            setProgress(p);
            if (p.stage === 'done') {
                toast.success(
                    `✅ Import done — Inserted: ${p.inserted}, Duplicates: ${p.duplicates}, Errors: ${p.errors}`
                );
            }
        };

        socket.on('connect', onConnect);
        socket.on('import:subscribed', onSubscribed);
        socket.on('import:progress', onProgress);

        if (socket.connected) onConnect();

        return () => {
            socket.off('connect', onConnect);
            socket.off('import:subscribed', onSubscribed);
            socket.off('import:progress', onProgress);
        };
    }, [uploadId]);

    const handleStartImport = async () => {
        if (files.length === 0) {
            toast.error('Please select a CSV or XLSX file first.');
            return;
        }

        try {
            const formData = new FormData();
            files.forEach((f) => formData.append('files', f));

            const res = await importLeads(formData).unwrap();
            setUploadId(res.uploadId);

            setProgress({
                total: res.total ?? 0,
                processed: 0,
                percentage: 0,
                inserted: 0,
                duplicates: 0,
                errors: 0,
                remaining: res.total ?? 0,
                stage: 'parsing',
            });

            toast.message('⏳ Import started', {
                description: `Upload #${res.uploadId.substring(0, 8)}…`,
            });
        } catch (err) {
            console.error(err);
            toast.error((err as Error).message || 'Import start failed.');
        }
    };

    const resetAll = () => {
        setFiles([]);
        setUploadId(null);
        setProgress(null);
        setIsSubscribed(false);
        setRowsToShow('all');
        setOpen(false);
    };

    const pct = progress?.percentage ?? 0;

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (!v) resetAll();
            }}
        >
            <DialogTrigger asChild>
                <Button variant="default">Import Leads</Button>
            </DialogTrigger>

            <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconDatabaseImport className="text-primary" />
                        Import Leads
                    </DialogTitle>
                    <DialogDescription>
                        Upload CSV or Excel. Track live progress while we
                        import.
                    </DialogDescription>
                </DialogHeader>

                {/* Before import */}
                {!uploadId && (
                    <>
                        {files.length === 0 ? (
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                                    isDragActive
                                        ? 'border-primary bg-primary/5'
                                        : 'border-muted-foreground/40 hover:border-primary/60'
                                }`}
                            >
                                <input {...getInputProps()} />
                                <IconFileSpreadsheet className="w-12 h-12 text-muted-foreground" />
                                {isDragActive ? (
                                    <p className="text-primary font-medium">
                                        Drop file here…
                                    </p>
                                ) : (
                                    <p className="text-muted-foreground">
                                        Drag & drop file here, or click to
                                        select
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-stone-50 text-sm shadow-sm">
                                    {files[0].name}
                                    <button
                                        onClick={() => setFiles([])}
                                        className="text-stone-500 hover:text-red-500"
                                    >
                                        <IconX size={16} />
                                    </button>
                                </span>

                                <Button
                                    onClick={handleStartImport}
                                    disabled={isLoading}
                                    variant="default"
                                    className="flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <IconLoader2 className="animate-spin" />
                                    ) : (
                                        <>🚀 Start Import</>
                                    )}
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* After import — live progress */}
                {uploadId && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <div className="font-medium">
                                    Upload ID:{' '}
                                    <span className="font-mono">
                                        {uploadId.slice(0, 8)}…
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    {isSubscribed ? (
                                        <>
                                            <IconCheck
                                                className="text-green-500"
                                                size={16}
                                            />{' '}
                                            Connected
                                        </>
                                    ) : (
                                        <>
                                            <IconLoader2
                                                className="animate-spin text-yellow-500"
                                                size={16}
                                            />{' '}
                                            Connecting…
                                        </>
                                    )}
                                </div>
                            </div>

                            <Button variant="secondary" onClick={resetAll}>
                                New Import
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    {progress?.stage === 'parsing' && (
                                        <IconDatabaseImport
                                            size={16}
                                            className="text-blue-500"
                                        />
                                    )}
                                    {progress?.stage === 'deduping' && (
                                        <IconCircleDot
                                            size={16}
                                            className="text-purple-500"
                                        />
                                    )}
                                    {progress?.stage === 'inserting' && (
                                        <IconLoader2
                                            size={16}
                                            className="animate-spin text-indigo-500"
                                        />
                                    )}
                                    {progress?.stage === 'done' && (
                                        <IconCheck
                                            size={16}
                                            className="text-green-600"
                                        />
                                    )}
                                    {progress?.stage ?? '—'}
                                </span>
                                <span>{pct}%</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <StatCard
                                label="Total"
                                value={progress?.total ?? 0}
                            />
                            <StatCard
                                label="Processed"
                                value={progress?.processed ?? 0}
                            />
                            <StatCard
                                label="Inserted"
                                value={progress?.inserted ?? 0}
                            />
                            <StatCard
                                label="Duplicates"
                                value={progress?.duplicates ?? 0}
                            />
                            <StatCard
                                label="Errors"
                                value={progress?.errors ?? 0}
                            />
                            <StatCard
                                label="Remaining"
                                value={progress?.remaining ?? 0}
                            />
                        </div>

                        {progress?.stage === 'done' && (
                            <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                                <IconCheck size={18} /> Import completed. You
                                can close this dialog or start a new import.
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="p-3 rounded-lg border bg-white flex flex-col items-start">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-lg font-semibold">{value}</div>
        </div>
    );
}
