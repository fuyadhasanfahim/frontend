'use client';

import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface CalendarWithTimeProps {
    value?: Date;
    onChange: (date: Date | undefined) => void;
}

export function CalendarWithTime({ value, onChange }: CalendarWithTimeProps) {
    const [open, setOpen] = React.useState(false);

    // Extract time safely
    const timeString = value
        ? `${String(value.getHours()).padStart(2, '0')}:${String(
              value.getMinutes()
          ).padStart(2, '0')}:${String(value.getSeconds()).padStart(2, '0')}`
        : '12:00:00';

    return (
        <div className="flex gap-4">
            {/* Date Picker */}
            <div className="flex flex-col gap-3">
                <Label htmlFor="date-picker" className="px-1">
                    Date
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date-picker"
                            className="w-40 justify-between font-normal"
                        >
                            {value ? value.toLocaleDateString() : 'Select date'}
                            <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto overflow-hidden p-0"
                        align="start"
                    >
                        <Calendar
                            mode="single"
                            selected={value}
                            captionLayout="dropdown"
                            onSelect={(selected) => {
                                if (!selected) {
                                    onChange(undefined);
                                    return;
                                }
                                // keep old time if already set
                                const newDate = new Date(selected);
                                if (value) {
                                    newDate.setHours(
                                        value.getHours(),
                                        value.getMinutes(),
                                        value.getSeconds()
                                    );
                                }
                                onChange(newDate);
                                setOpen(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Time Picker */}
            <div className="flex flex-col gap-3">
                <Label htmlFor="time-picker" className="px-1">
                    Time
                </Label>
                <Input
                    type="time"
                    id="time-picker"
                    step="60" // 1 min precision, use 1 for seconds
                    value={timeString}
                    onChange={(e) => {
                        if (!value) {
                            const now = new Date();
                            const [h, m, s] = e.target.value
                                .split(':')
                                .map(Number);
                            now.setHours(h, m, s || 0);
                            onChange(now);
                        } else {
                            const newDate = new Date(value);
                            const [h, m, s] = e.target.value
                                .split(':')
                                .map(Number);
                            newDate.setHours(h, m, s || 0);
                            onChange(newDate);
                        }
                    }}
                />
            </div>
        </div>
    );
}
