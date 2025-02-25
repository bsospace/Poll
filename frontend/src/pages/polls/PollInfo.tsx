import React, { useEffect, useState } from "react";
import { Calendar, Clock, Users, Star, Info } from "lucide-react";
import { IPoll } from "@/interfaces/interfaces";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DateFormatFullTime } from "@/lib/DateFormat";

interface PollInfoProps {
  poll: IPoll;
  pollParticipantCount: number;
  userPoint: number;
}

const PollInfo: React.FC<PollInfoProps> = ({ poll, pollParticipantCount, userPoint }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    const updateRemainingTime = () => {
      const now = new Date();
      const start = new Date(poll.startVoteAt);
      const end = new Date(poll.endVoteAt);

      if (now > end) {
        setTimeRemaining("Poll has ended");
        return;
      }

      const targetTime = now < start ? start : end;
      const diffTime = Math.max(targetTime.getTime() - now.getTime(), 0);

      const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days} day${days > 1 ? "s" : ""} ${hours}h ${minutes}m ${seconds}s remaining`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s remaining`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s remaining`);
      }
    };

    updateRemainingTime(); // เรียกครั้งแรกเพื่อให้ UI อัปเดตทันที

    const interval = setInterval(updateRemainingTime, 1000); // อัปเดตทุก 1 วินาที

    return () => clearInterval(interval); // Cleanup เมื่อ component ถูก unmount
  }, [poll.startVoteAt, poll.endVoteAt]);

  return (
    <div className="p-6 mb-6 bg-white rounded-lg shadow-sm">
      {/* Title & Status */}
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h1 className="text-lg font-bold sm:text-xl">{poll.question || "Poll"}</h1>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            new Date() < new Date(poll.startVoteAt)
              ? "text-yellow-800 bg-yellow-100"
              : new Date() > new Date(poll.endVoteAt)
              ? "text-gray-800 bg-gray-100"
              : "text-green-800 bg-green-100"
          }`}
        >
          {new Date() < new Date(poll.startVoteAt) ? "Not Started" : new Date() > new Date(poll.endVoteAt) ? "Ended" : "Active"}
        </span>
      </div>

      {/* Time Remaining */}
      <div className="p-3 mb-4 border border-blue-100 rounded-lg bg-blue-50">
        <div className="flex items-center gap-2 text-blue-800">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="font-medium">{timeRemaining}</span>
        </div>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {/* Start Date */}
        <div className="flex items-center gap-2 p-3 rounded-md bg-gray-50">
          <Calendar className="w-4 h-4 text-gray-600" />
          <div className="text-sm">
            <div className="text-xs text-gray-500">Start</div>
            <div>{DateFormatFullTime(poll.startVoteAt)}</div>
          </div>
        </div>

        {/* End Date */}
        <div className="flex items-center gap-2 p-3 rounded-md bg-gray-50">
          <Calendar className="w-4 h-4 text-gray-600" />
          <div className="text-sm">
            <div className="text-xs text-gray-500">End</div>
            <div>{DateFormatFullTime(poll.endVoteAt)}</div>
          </div>
        </div>

        {/* Participants */}
        <div className="flex items-center gap-2 p-3 rounded-md bg-gray-50">
          <Users className="w-4 h-4 text-gray-600" />
          <div className="text-sm">
            <div className="text-xs text-gray-500">Participants</div>
            <div>{pollParticipantCount} voted</div>
          </div>
        </div>

        {/* User Points (Only for non-public polls) */}
        {!poll.isPublic && userPoint > 0 && (
          <div className="flex items-center gap-2 p-3 text-blue-800 rounded-md bg-blue-50">
            <Star className="w-4 h-4 text-blue-600" />
            <div className="text-sm">
              <div className="text-xs text-blue-600">Your Points</div>
              <div className="font-medium">{userPoint} available</div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="cursor-pointer">
                  <Info className="w-4 h-4 ml-1 text-blue-400" aria-label="Point Info" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Points can be used to vote on poll options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Poll Description */}
      {poll.description && (
        <div className="mt-4 text-sm text-gray-600">
          <h3 className="mb-1 font-medium">Description</h3>
          <p>{poll.description}</p>
        </div>
      )}
    </div>
  );
};

export default PollInfo;
