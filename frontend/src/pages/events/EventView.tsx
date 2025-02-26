import { useEffect, useState } from "react";
import { Loader2, AlertCircle, ArrowLeft, Plus, Users, UserCheck, User, Download } from "lucide-react";
import { axiosInstance } from "@/lib/Utils";
import { IEvent } from "@/interfaces/interfaces";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as XLSX from "xlsx";
import { Separator } from '@/components/ui/separator';

export default function EventView() {
    interface IEventResponse {
        success: boolean;
        message: string;
        data: IEvent;
    }

    const { id } = useParams();
    const [event, setEvent] = useState<IEvent | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get<IEventResponse>(`/events/${id}`);
            setEvent(response.data.data);
        } catch (error) {
            setError("Failed to fetch event details. Please try again later.");
            console.error("Error fetching event:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Get initials for avatar fallback
    interface IGetInitials {
        (name: string): string;
    }

    const getInitials: IGetInitials = (name) => {
        if (!name) return "?";
        return name.split(' ').map(part => part[0]).join('').toUpperCase();
    };

    const downloadGuestsAsExcel = () => {
        if (!event?.guests || event.guests.length === 0) {
            alert("No guests to export.");
            return;
        }

        const guestData = event.guests.map((guest) => ({
            Name: guest.name,
            Key: guest.key,
            QR_URL: `${window.location.origin}/guest/login?key=${guest.key}`,
        }));

        const worksheet = XLSX.utils.json_to_sheet(guestData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Guests");

        XLSX.writeFile(workbook, `Guests_${event.name}.xlsx`);
    };

    return (
        <div className="max-w-4xl p-4 mx-auto md:p-6">
            <div className="flex items-center justify-between mb-6">
                <Link to="/events" className="flex items-center text-gray-600 transition-colors hover:text-orange-500">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span>Back to Events</span>
                </Link>

                {event && (
                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                        {event.polls?.length || 0} Polls
                    </Badge>
                )}
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-10 h-10 mb-4 text-orange-500 animate-spin" />
                </div>
            ) : (
                event && (
                    <div className="space-y-6">
                        <Card className="overflow-hidden border-none shadow-md">
                            <div className="p-6 ">
                                <h1 className="text-2xl font-bold">{event.name}</h1>
                                {event.description && (
                                    <p className="mt-2 ">{event.description}</p>
                                )}
                                {!event.description && (
                                    <p className="mt-2 italic">No description provided</p>
                                )}
                            </div>
                        </Card>

                        <Tabs defaultValue="polls" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                <TabsTrigger value="polls">Polls</TabsTrigger>
                                <TabsTrigger value="whitelist">Whitelist ({event.whitelist?.length || 0})</TabsTrigger>
                                <TabsTrigger value="guests">Guests ({event.guests?.length || 0})</TabsTrigger>
                            </TabsList>

                            <TabsContent value="polls" className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Poll List</h2>
                                    <Link to={`/event/${id}/polls/create`}>
                                        <Button className="gap-2">
                                            <Plus className="w-4 h-4" />
                                            Create Poll
                                        </Button>
                                    </Link>
                                </div>

                                {!event.polls || event.polls.length === 0 ? (
                                    <Card className="border border-dashed">
                                        <CardContent className="pt-6 text-center">
                                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-3 rounded-full bg-orange-50">
                                                <Plus className="w-6 h-6 text-orange-500" />
                                            </div>
                                            <h3 className="mb-1 font-medium">No polls yet</h3>
                                            <p className="mb-4 text-sm text-gray-500">Create your first poll for this event</p>
                                            <Link to={`/event/${id}/polls/create`}>
                                                <Button variant="outline" size="sm" className="gap-1">
                                                    <Plus className="w-3 h-3" />
                                                    Create Now
                                                </Button>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4">
                                        {event.polls.map((poll) => (
                                            <Link to={`/polls/${poll.id}/result`}>
                                                <Card className="p-4 transition-all bg-white border cursor-pointer hover:border-orange-300 hover:shadow">
                                                    <h3 className="mb-2 text-lg font-medium">{poll.question}</h3>
                                                    <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                                                        <p>
                                                            Created: {new Date(poll.createdAt).toLocaleDateString()}
                                                        </p>
                                                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                            {poll.options?.length || 0} options
                                                        </Badge>
                                                    </div>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="whitelist">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Whitelisted Users</CardTitle>
                                            <UserCheck className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <CardDescription>Users with dedicated access to this event</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {event.whitelist && event.whitelist.length > 0 ? (
                                            <div className="space-y-4">
                                                {event.whitelist.map((whitelistItem) => (
                                                    <>
                                                        <div key={whitelistItem.id} className="flex items-center justify-between transition-colors rounded-lg">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar>
                                                                    <AvatarImage src={whitelistItem.user.avatar} />
                                                                    <AvatarFallback>{getInitials(whitelistItem.user.firstName + ' ' + whitelistItem.user.lastName)}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium">
                                                                        {whitelistItem.user.firstName || whitelistItem.user.email.split('@')[0]} {whitelistItem.user.lastName || ''}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500">{whitelistItem.user.email}</p>
                                                                </div>
                                                            </div>
                                                            <Badge variant="secondary">
                                                                {whitelistItem.point} points
                                                            </Badge>
                                                        </div>
                                                        <Separator/>
                                                    </>

                                                ))}
                                            </div>
                                        ) : (
                                            <p className="py-6 text-center text-gray-500">No whitelisted users</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="guests">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Guest Access</CardTitle>
                                            <Users className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <CardDescription>Anonymous users with access keys</CardDescription>
                                        <div className="flex min-w-full gap-4 mb-4">
                                            <Button variant={
                                                'outline'
                                            } onClick={downloadGuestsAsExcel} className="gap-2 ">
                                                <Download className="w-4 h-4" />
                                                Download Excel
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {event.guests && event.guests.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                {event.guests.map((guest) => (
                                                    <Card key={guest.id} className="p-3 border-dashed">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                                                                    <User className="w-4 h-4 text-orange-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{guest.name}</p>
                                                                    <p className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">{guest.key}</p>
                                                                </div>
                                                            </div>
                                                            <Badge variant="outline" className="text-xs">
                                                                {guest.point} pt
                                                            </Badge>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="py-6 text-center text-gray-500">No guest access created</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                )
            )}
        </div>
    );
}