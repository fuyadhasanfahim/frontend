'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ImportLeadsCard() {
    const [file, setFile] = useState<File | null>(null);

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

        const res = await fetch('/api/leads/import', {
            method: 'POST',
            body: formData,
        });

        if (res.ok) {
            toast.success('File imported successfully');
        } else {
            toast.error('Import failed');
        }
    };

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Import Leads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileChange}
                />
                <Button className="w-full" onClick={handleUpload}>
                    Upload
                </Button>
            </CardContent>
        </Card>
    );
}
