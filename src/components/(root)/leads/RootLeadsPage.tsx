'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { useImportLeadsMutation } from '@/redux/features/lead/leadApi';
import { Loader2, Upload } from 'lucide-react';

export default function ImportLeadsCard() {
    const [file, setFile] = useState<File | null>(null);
    const [importLeads, { isLoading }] = useImportLeadsMutation();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await importLeads(formData).unwrap();
            toast.success(
                `Imported ${res.inserted} leads (errors: ${res.errors ?? 0})`
            );
            setFile(null);
        } catch (err) {
            console.log(err)
            toast.error('Import failed. Please try again.');
        }
    };

    return (
        <Card className="max-w-lg mx-auto shadow-md border border-stone-200">
            <CardHeader>
                <CardTitle className="text-xl font-bold">
                    📥 Import Leads
                </CardTitle>
                <CardDescription>
                    Upload a CSV or Excel file to bulk import leads into the
                    system.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <Input
                        type="file"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                    />
                    {file && (
                        <p className="text-sm text-stone-500">
                            Selected:{' '}
                            <span className="font-medium text-stone-800">
                                {file.name}
                            </span>
                        </p>
                    )}
                </div>

                <Button
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleUpload}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4" />
                            Upload File
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
