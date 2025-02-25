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
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [poll.startVoteAt, poll.endVoteAt]);

  const now = new Date();
  const startDate = new Date(poll.startVoteAt);
  const endDate = new Date(poll.endVoteAt);
  const status = now < startDate ? "Not Started" : now > endDate ? "Ended" : "Active";
  const statusColors = {
    "Not Started": "text-yellow-800 bg-yellow-100",
    "Active": "text-green-800 bg-green-100",
    "Ended": "text-gray-800 bg-gray-100"
  };

  return (
    <div className="p-4 mb-4 bg-white rounded-lg shadow-sm">
      {/* Header with Title & Status */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg font-bold truncate">{poll.question || "Poll"}</h1>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
          {status}
        </span>
      </div>

      {/* Time Remaining Banner */}
      <div className="p-2 mb-3 border border-blue-100 rounded-lg bg-blue-50">
        <div className="flex items-center gap-1 text-blue-800">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">{timeRemaining}</span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 sm:grid-cols-4">
        {/* Start Date */}
        <InfoCard icon={<Calendar className="w-4 h-4 text-gray-600" />} label="Start" value={DateFormatFullTime(poll.startVoteAt)} />
        
        {/* End Date */}
        <InfoCard icon={<Calendar className="w-4 h-4 text-gray-600" />} label="End" value={DateFormatFullTime(poll.endVoteAt)} />
        
        {/* Participants */}
        <InfoCard icon={<Users className="w-4 h-4 text-gray-600" />} label="Participants" value={`${pollParticipantCount} voted`} />
        
        {/* User Points */}
        {!poll.isPublic && userPoint > 0 && (
          <div className="flex items-center gap-2 p-2 text-blue-800 rounded-md bg-blue-50">
            <Star className="w-4 h-4 text-blue-600" />
            <div className="text-xs">
              <div className="text-blue-600">Your Points</div>
              <div className="font-medium">{userPoint}</div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3 text-blue-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Points for voting on options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Description (only if exists) */}
      {poll.description && (
        <div className="text-xs text-gray-600">
          <h3 className="mb-1 font-medium">Description</h3>
          <p className="line-clamp-2">{poll.description}</p>
        </div>
      )}
    </div>
  );
};

// Reusable info card component to reduce repetition
interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 p-2 rounded-md bg-gray-50">
    {icon}
    <div className="text-xs">
      <div className="text-gray-500">{label}</div>
      <div className="truncate">{value}</div>
    </div>
  </div>
);

export default PollInfo;