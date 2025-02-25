import { useEffect, useState } from "react";
import { Loader2, AlertCircle, ArrowLeft, Plus } from "lucide-react";
import { axiosInstance } from "@/lib/Utils";
import { IEvent } from "@/interfaces/interfaces";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";

export default function EventView() {
    interface IEventResponse {
        success: boolean;
        message: string;
        data: IEvent;
    }

    const { id } = useParams(); // ดึง 'id' จาก URL
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

    return (
        <div className="max-w-4xl md:p-6 mx-auto">
            <div className="flex items-center mb-6">
                <Link to="/events" className="flex items-center text-gray-600 hover:text-orange-500">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Events
                </Link>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
            ) : (
                event && (
                    <>
                        <h1 className="text-3xl font-bold">{event.name}</h1>
                        <p className="mt-4 text-gray-600">{event.description}</p>

                        {/* Polls Section with Create Poll button */}
                        <div className="flex items-center justify-between mt-6">
                            <h2 className="text-xl font-semibold">Polls</h2>
                            {/* ปุ่ม Create Poll */}
                            <Link to={`/event/${id}/polls/create`}>
                                <Button className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Create Poll
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-6">
                            {!event.polls || event.polls.length === 0 ? (
                                <p className="py-6 text-center text-gray-500">No polls available for this event</p>
                            ) : (
                                <div className="space-y-4 mt-4">
                                    {event.polls.map((poll) => (
                                        <div key={poll.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md bg-white">
                                            <h3 className="mb-2 text-lg font-medium">{poll.question}</h3>
                                            <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
                                                <p>
                                                    Created: {new Date(poll.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )
            )}
        </div>
    );
}
