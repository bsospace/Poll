import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EventDetailsProps {
    name: string;
    setName: (name: string) => void;
    description: string;
    setDescription: (description: string) => void;
    handleNextTab: () => void;
}

const EventDetails = (
    { name, setName, description, setDescription, handleNextTab }: EventDetailsProps
) => {
    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                    <CardDescription>Enter the basic information for the event</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-base">Event Name <span className="text-red-500">*</span></Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Annual Conference 2025"
                            className="h-12"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-base">Event Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the event details"
                            className="min-h-32"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="button"
                            onClick={handleNextTab}
                            className="w-32"
                            disabled={!name}
                        >
                            Next
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default EventDetails;
