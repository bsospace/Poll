import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableCell, TableHead, TableRow, TableHeader, Table, TableBody } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyRound, PlusCircle, Trash2, User, AlertCircle, Copy, Users, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { IGuest } from '@/interfaces/interfaces';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    const [activeTab, setActiveTab] = useState('registered');
    const [copied, setCopied] = useState<string | null>(null);

    const handleWhitelistInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWhitelistInputValue(e.target.value);
        setWhitelistInput(e.target.value);
        setInputError(null);
    };

    const validateAndAddWhitelist = () => {
        if (!whitelistInputValue.trim()) {
            setInputError('Please enter at least one email address');
            return;
        }
        setInputError(null);
        handleAddWhitelist();
        setWhitelistInputValue('');
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
            setInputError('Number of guests must be greater than 0');
            return;
        }
        handleGenerateGuest();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(text);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <TooltipProvider>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col mb-6 space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
                    <TabsList className="h-10 w-full md:w-auto">
                        <TabsTrigger value="registered" className="flex items-center gap-2 w-full md:w-auto">
                            <Users size={16} />
                                Participants
                            <Badge variant="secondary" className="ml-1">{whitelist.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="guest" className="flex items-center gap-2 w-full md:w-auto">
                            <KeyRound size={16} />
                                Guest Codes
                            <Badge variant="secondary" className="ml-1">{guest?.length || 0}</Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="registered" className="mt-0">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Registered Participants</span>
                                <Badge variant="outline" className="ml-2">
                                    {whitelist.length} {whitelist.length === 1 ? 'Participant' : 'Participants'}
                                </Badge>
                            </CardTitle>
                            <CardDescription>Add participants who registered in advance</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 border rounded-lg bg-gray-50/50">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="whitelist-email" className="flex mb-2">
                                                <p className="mr-2">Participant Email(s)</p>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle size={14} />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="max-w-xs">Enter multiple emails separated by commas</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </Label>
                                        </div>
                                        <Input
                                            id="whitelist-email"
                                            placeholder="example@mail.com, example2@mail.com"
                                            value={whitelistInputValue}
                                            onChange={handleWhitelistInputChange}
                                            className={inputError ? 'border-red-500' : ''}
                                        />
                                    </div>

                                    <div className="w-full sm:w-24">
                                        <Label htmlFor="whitelist-point" className="mb-2 flex">
                                            <p className="mr-2">Points</p>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle size={14} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">Initial Point of Participant (default 1)</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </Label>
                                        <Input
                                            id="whitelist-point"
                                            type="number"
                                            value={initialWhitelistPoints}
                                            onChange={(e) => setInitialWhitelistPoints(Number(e.target.value))}
                                            min="1"
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
                                    <Alert variant="destructive" className="py-2 mt-4">
                                        <AlertCircle className="w-4 h-4" />
                                        <AlertDescription>{inputError}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <ScrollArea className="min-h-64 h-full rounded-md">
                                {whitelist.length > 0 ? (
                                    <div className="overflow-hidden border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-3/5">Email</TableHead>
                                                    <TableHead className="w-1/5">Points</TableHead>
                                                    <TableHead className="w-1/5 text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {whitelist.map(({ email, point }) => (
                                                    <TableRow key={email}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <User size={16} className="flex-shrink-0 text-gray-400" />
                                                                <span className="truncate">{email}</span>
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
                                                            <div className="flex justify-end gap-1">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => copyToClipboard(email)}
                                                                            className="text-gray-500 hover:text-gray-700"
                                                                            aria-label={`Copy ${email}`}
                                                                        >
                                                                            <Copy size={16} />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        {copied === email ? 'Copied!' : 'Copy email'}
                                                                    </TooltipContent>
                                                                </Tooltip>

                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() => handleRemoveWhitelist(email)}
                                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                            aria-label={`Remove ${email}`}
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Remove participant</TooltipContent>
                                                                </Tooltip>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-8 text-center border rounded-md bg-gray-50">
                                        <Users size={32} className="mb-2 text-gray-400" />
                                        <p className="text-gray-500">No participants added yet</p>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => document.getElementById('whitelist-email')?.focus()} 
                                            className="mt-4"
                                            size="sm"
                                        >
                                            Add participants
                                        </Button>
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="guest" className="mt-0">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Guest keys</span>
                                <Badge variant="outline" className="ml-2">
                                    {guest?.length ?? 0} {guest?.length === 1 ? 'Code' : 'Codes'}
                                </Badge>
                            </CardTitle>
                            <CardDescription>Generate access keys for unregistered guests</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 border rounded-lg bg-gray-50/50">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                                    <div className="w-full sm:w-32">
                                        <Label htmlFor="guest-number" className="block mb-2">Number of Keys</Label>
                                        <Input
                                            id="guest-number"
                                            type="number"
                                            value={guestNumber}
                                            onChange={(e) => setGuestNumber(Number(e.target.value))}
                                            min="0"
                                        />
                                    </div>
                                    <div className="w-full sm:w-32">
                                        <Label htmlFor="guest-point" className="flex mb-2">
                                            <p className="mr-2">Points</p>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle size={14} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="max-w-xs">Initial Point per Guest (default 1)</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </Label>

                                        <Input
                                            id="guest-point"
                                            type="number"
                                            value={guestPoint}
                                            onChange={(e) => setGuestPoint(Number(e.target.value))}
                                            min="1"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button
                                            onClick={validateAndGenerateGuests}
                                            className="flex w-full h-10 gap-2 sm:w-auto"
                                            disabled={guestNumber <= 0}
                                        >
                                            <KeyRound size={16} />
                                            {guest && guest.length > 0 ? 'Generate more' : 'Generate'}
                                        </Button>
                                    </div>
                                </div>

                                {inputError && (
                                    <Alert variant="destructive" className="py-2 mt-4">
                                        <AlertCircle className="w-4 h-4" />
                                        <AlertDescription>{inputError}</AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <ScrollArea className="min-h-64 h-full rounded-md">
                                {guest && guest.length > 0 ? (
                                    <div className="overflow-hidden border rounded-md">
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
                                                {guest.map(({ name, key, point }, index) => (
                                                    <TableRow key={key}>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <User size={16} className="flex-shrink-0 text-gray-400" />
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
                                                            <div className="flex items-center gap-2">
                                                                <Badge
                                                                    className="font-mono cursor-pointer"
                                                                    onClick={() => copyToClipboard(key)}
                                                                >
                                                                    {key}
                                                                </Badge>
                                                                {copied === key && (
                                                                    <Badge variant="outline" className="text-xs text-green-600 bg-green-50">
                                                                        Copied!
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                value={point}
                                                                onChange={(e) => handleGuestPointChange(Number(e.target.value), index)}
                                                                min="0"
                                                                className="w-20"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                        aria-label={`Remove ${name}`}
                                                                        onClick={() => {
                                                                            const updatedGuests = guest.filter((_, i) => i !== index);
                                                                            setGuest(updatedGuests.length > 0 ? updatedGuests : null);
                                                                        }}
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Remove guest code</TooltipContent>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full py-8 text-center border rounded-md bg-gray-50">
                                        <KeyRound size={32} className="mb-2 text-gray-400" />
                                        <p className="text-gray-500">No guest codes generated yet</p>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => document.getElementById('guest-number')?.focus()} 
                                            className="mt-4"
                                            size="sm"
                                        >
                                            Generate codes
                                        </Button>
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-between mt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevTab}
                    className="gap-2"
                >
                    <ChevronLeft size={16} />
                    Back
                </Button>
                <Button
                    type="button"
                    onClick={handleNextTab}
                    className="gap-2"
                >
                    Next
                    <ChevronRight size={16} />
                </Button>
            </div>
        </TooltipProvider>
    );
}

export default Participants;