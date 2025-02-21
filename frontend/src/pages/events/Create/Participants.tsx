import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableCell, TableHead, TableRow, TableHeader, Table, TableBody } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyRound, PlusCircle, Trash2, User, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import { IGuest } from '@/interfaces/interfaces';
import { Badge } from '@/components/ui/badge';

interface WhitelistEntry {
    email: string;
    point: number;
}

interface ParticipantsProps {
    whitelist: WhitelistEntry[];
    setWhitelistInput: (whitelistInput: string) => void;

    initialWhitelistPoints: number;
    setInitialWhitelistPoints: (initialWhitelistPoints: number) => void;

    handleUpdateWhitelistPoint: (email: string, point: number) => void;

    guest: IGuest[] | null;
    setGuest: (guest: IGuest[] | null) => void;

    guestNumber: number;
    setGuestNumber: (guestNumber: number) => void;
    guestPoint: number;
    setGuestPoint: (guestPoint: number) => void;
    handleAddWhitelist: () => void;
    handleRemoveWhitelist: (email: string) => void;
    handleGenerateGuest: () => void;
    handleNextTab: () => void;
    handlePrevTab: () => void;
}

function Participants({
    whitelist,
    setWhitelistInput,

    initialWhitelistPoints,
    setInitialWhitelistPoints,

    handleUpdateWhitelistPoint,

    guest,
    setGuest,
    guestNumber,
    setGuestNumber,
    guestPoint,
    setGuestPoint,
    handleAddWhitelist,
    handleRemoveWhitelist,
    handleGenerateGuest,
    handleNextTab,
    handlePrevTab,
}: ParticipantsProps): JSX.Element {
    const [whitelistInputValue, setWhitelistInputValue] = useState('');
    const [inputError, setInputError] = useState<string | null>(null);

    const handleWhitelistInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWhitelistInputValue(e.target.value);
        setWhitelistInput(e.target.value);
        setInputError(null);
    };

    const validateAndAddWhitelist = () => {
        if (!whitelistInputValue.trim()) {
            setInputError('Please enter an email to add');
            return;
        }
        setInputError(null);
        handleAddWhitelist();
    };

    const handleGuestPointChange = (point: number, index: number) => {
        if (guest) {
            const updatedGuests = [...guest];
            updatedGuests[index] = { ...updatedGuests[index], point };
            setGuest(updatedGuests);
        }
    };

    const validateAndGenerateGuests = () => {
        if (guestNumber <= 0) {
            alert('Number of guests must be greater than 0');
            return;
        }
        handleGenerateGuest();
    };

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Participants List</CardTitle>
                    <CardDescription>Manage participant details and points</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="mb-8 space-y-3">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="flex-grow">
                                <div>
                                    <Label htmlFor="whitelist-email" className="block mb-2">Participant's Email</Label>
                                    <Input
                                        id="whitelist-email"
                                        placeholder="example@mail.com, example2@mail.com"
                                        value={whitelistInputValue}
                                        onChange={handleWhitelistInputChange}
                                        className={inputError ? 'border-red-500' : ''}
                                    />
                                </div>
                            </div>

                            <div className="w-full sm:w-24">
                                <Label htmlFor="whitelist-point" className="block mb-2">Points</Label>
                                <Input
                                    id="whitelist-point"
                                    type="number"
                                    value={initialWhitelistPoints}
                                    onChange={(e) => setInitialWhitelistPoints(Number(e.target.value))}
                                    min="0"
                                />
                            </div>
                            <Button
                                onClick={validateAndAddWhitelist}
                                className="flex items-center w-full h-10 gap-2 sm:w-auto"
                            >
                                <PlusCircle size={16} />
                                Add
                            </Button>
                        </div>

                        {inputError && (
                            <Alert variant="destructive" className="py-2">
                                <AlertCircle className="w-4 h-4" />
                                <AlertDescription>{inputError}</AlertDescription>
                            </Alert>
                        )}

                        <p className="text-xs text-gray-500">You can specify multiple emails separated by commas (,)</p>
                        <div className="mt-4 overflow-y-auto max-h-96">
                            {whitelist.length > 0 ? (
                                <div className="overflow-hidden border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Points</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {whitelist.map(({ email, point }) => (
                                                <TableRow key={email}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <User size={16} className="text-gray-400" />
                                                            {email}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={point}
                                                            onChange={(e) => handleUpdateWhitelistPoint(email, Number(e.target.value))}
                                                            className="w-20"
                                                            min="0"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleRemoveWhitelist(email)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            aria-label={`Remove ${email}`}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="py-8 text-center border rounded-md bg-gray-50">
                                    <p className="text-gray-500">No participants added yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 border-t">
                        <div className="flex flex-col justify-between gap-4 mb-6 md:flex-row md:items-center">
                            <div>
                                <h3 className="flex items-center gap-2 text-lg font-medium">
                                    <KeyRound size={18} />
                                    Generate Codes for General Guests
                                </h3>
                                <p className="text-sm text-gray-500">For guests who didn't register in advance</p>
                            </div>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <div className="w-full sm:w-32">
                                    <Label htmlFor="guest-point" className="block mb-2">Points</Label>
                                    <Input
                                        id="guest-point"
                                        type="number"
                                        value={guestPoint}
                                        onChange={(e) => setGuestPoint(Number(e.target.value))}
                                        min="0"
                                    />
                                </div>
                                <div className="w-full sm:w-32">
                                    <Label htmlFor="guest-number" className="block mb-2">Number of Guests</Label>
                                    <Input
                                        id="guest-number"
                                        type="number"
                                        value={guestNumber}
                                        onChange={(e) => setGuestNumber(Number(e.target.value))}
                                        min="0"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={validateAndGenerateGuests}
                                        className="w-full h-10 sm:w-auto"
                                        disabled={guestNumber <= 0}
                                    >
                                        Generate Codes
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 overflow-y-auto max-h-96">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Points</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {guest && guest.length > 0 ? (
                                        guest.map(({ name, key, point }, index) => (
                                            <TableRow key={key}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <User size={16} className="text-gray-400" />
                                                        <Input
                                                            value={name}
                                                            onChange={(e) => {
                                                                const updatedGuests = [...guest];
                                                                updatedGuests[index] = { ...updatedGuests[index], name: e.target.value };
                                                                setGuest(updatedGuests);
                                                            }}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge>{key}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={point}
                                                        onChange={(e) => handleGuestPointChange(Number(e.target.value), index)}
                                                        min="0"
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        aria-label={`Remove ${name}`}
                                                        onClick={() => {
                                                            const updatedGuests = guest.filter((_, i) => i !== index);
                                                            setGuest(updatedGuests);
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : guestNumber > 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="py-8 text-center border rounded-lg shadow-md bg-gray-50">
                                                <p className="text-gray-500">Click "Generate Codes" to create codes for guests</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : null}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    <div className="flex justify-between pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrevTab}
                            className="w-32"
                        >
                            Back
                        </Button>
                        <Button
                            type="button"
                            onClick={handleNextTab}
                            className="w-32"
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default Participants;
