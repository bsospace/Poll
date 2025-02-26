import { IPoll } from "@/interfaces/interfaces";
import { DateFormatFull, DateFormatFullTime } from "@/lib/DateFormat";
import { useAuth } from "@/hooks/UseAuth";
import { Link } from "react-router-dom";
import { CalendarCheck, CalendarClock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

// Polls List Component
export function Polls({ polls }: { readonly polls: IPoll[] }) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {polls && polls?.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
            ))}
        </div>
    );
}

// Event Tag Component
function EventTag({ name }: { name: string }) {
    return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 hover:bg-blue-100 transition-colors">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">{name}</span>
        </div>
    );
}

// Poll Card Component
function PollCard({ poll }: { readonly poll: IPoll }) {
    const { user } = useAuth();

    // Memoized Dates
    const now = Date.now();
    const pollStartTime = new Date(poll.startVoteAt).getTime();
    const pollEndTime = new Date(poll.endVoteAt).getTime();
    const isPollActive = now < pollEndTime;
    const hasVoted = poll.votes?.some((vote) => vote.userId === user?.id);

    if (!isPollActive) return null; // Hide inactive polls

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="relative">
                <Badge className={`absolute top-4 left-4 ${pollStartTime > now ? "" : "bg-red-500 hover:bg-red-400"} text-white`}>
                    {pollStartTime > now
                        ? `เริ่มใน${DateFormatFullTime(poll.startVoteAt, "TH-th")}`
                        : `สิ้นสุดใน${DateFormatFullTime(poll.endVoteAt, "TH-th")}`}
                </Badge>
                <img
                    src={poll.banner ?? "https://placehold.co/600x400/EEE/31343C"}
                    alt={poll.question}
                    className="rounded-lg max-h-48 object-cover mb-2"
                />
                <h2 className="text-xl font-semibold line-clamp-1">{poll.question}</h2>
                <p className="text-gray-600 line-clamp-2">{poll.description}</p>
            </CardHeader>

            <CardContent>
                {/* Event tag */}
                {poll.event && (
                    <div className="mb-4">
                        <EventTag name={poll.event.name} />
                    </div>
                )}

                {/* Poll Duration */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                        <CalendarClock className="w-4 h-4 mr-1" />
                        <span>{DateFormatFull(poll.startVoteAt, "TH-th")}</span>
                    </div>
                    <div className="flex items-center">
                        <CalendarCheck className="w-4 h-4 mr-1" />
                        <span>{DateFormatFull(poll.endVoteAt, "TH-th")}</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-between">
                <Button asChild className="w-full">
                    <Link to={`/polls/${poll.id}`}>{hasVoted ? "แก้ไขคะแนน" : "ลงคะแนน"}</Link>
                </Button>
                {hasVoted && (
                    <Button asChild className="w-1/3 ml-2" variant="outline">
                        <Link to={`/polls/${poll.id}`}>ดูผล</Link>
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

export default Polls;