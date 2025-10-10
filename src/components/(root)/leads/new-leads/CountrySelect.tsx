'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    useGetCountriesQuery,
    useAddCountryMutation,
} from '@/redux/features/country/countryApi';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

type CountrySelectProps = {
    value: string | null;
    onChange: (value: string) => void;
    className?: string;
};

export function CountrySelect({
    value,
    onChange,
    className,
}: CountrySelectProps) {
    const [open, setOpen] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [newCountry, setNewCountry] = React.useState('');

    // 👉 API hooks
    const { data: countries, isLoading, refetch } = useGetCountriesQuery({});
    const [addCountry, { isLoading: adding }] = useAddCountryMutation();

    // 👉 track trigger width
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const [triggerWidth, setTriggerWidth] = React.useState<number>();

    React.useEffect(() => {
        if (triggerRef.current) {
            setTriggerWidth(triggerRef.current.offsetWidth);
        }
    }, [open]);

    const handleAddCountry = async () => {
        if (!newCountry.trim()) return;
        try {
            await addCountry({ name: newCountry.trim() }).unwrap();
            toast.success('Country added successfully');
            setNewCountry('');
            setDialogOpen(false);
            refetch();
        } catch (err) {
            toast.error((err as Error).message || 'Failed to add country');
        }
    };

    return (
        <div className={cn('flex items-center gap-2 w-auto', className)}>
            {isLoading ? (
                <Spinner />
            ) : (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            ref={triggerRef}
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="flex-1 justify-between capitalize"
                        >
                            {value ? value : 'Select country...'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="p-0"
                        style={{ width: triggerWidth }}
                    >
                        <Command>
                            <CommandInput placeholder="Search country..." />
                            <CommandList>
                                <CommandEmpty>No country found.</CommandEmpty>
                                <CommandGroup>
                                    {countries?.map(
                                        (c: { _id: string; name: string }) => (
                                            <CommandItem
                                                className="capitalize"
                                                key={c._id}
                                                value={c.name}
                                                onSelect={(currentValue) => {
                                                    onChange(currentValue);
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        value === c.name
                                                            ? 'opacity-100'
                                                            : 'opacity-0'
                                                    )}
                                                />
                                                {c.name}
                                            </CommandItem>
                                        )
                                    )}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}

            {/* Add Country Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Plus className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Country</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Enter country name"
                            value={newCountry}
                            onChange={(e) => setNewCountry(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddCountry} disabled={adding}>
                            {adding ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
