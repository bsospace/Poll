import React from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IOption } from "@/interfaces/interfaces";

interface PollOptionsProps {
    pollOptions: IOption[];
    optionVoteCounts: Record<string, number>;
    totalVotes: number;
    userVotedOption: { optionId: string; optionName: string; votes: number }[];
    isActive: boolean;
    userHasVoted: boolean;
    userPoint: number;
    showResult: boolean;
    openVoteDialog: (optionId: string) => void;
}

const PollOptions: React.FC<PollOptionsProps> = ({
  pollOptions,
  optionVoteCounts,
  totalVotes,
  userVotedOption,
  isActive,
  userHasVoted,
  userPoint,
  showResult,
  openVoteDialog,
}) => {
  const calculatePercentage = (optionId: string) => {
    if (totalVotes === 0) return 0;
    return Math.round((optionVoteCounts[optionId] || 0) / totalVotes * 100);
  };

  // Sort options by vote count if showing results
  const sortedOptions = [...pollOptions];
  if (showResult) {
    sortedOptions.sort((a, b) => 
      (optionVoteCounts[b.id] || 0) - (optionVoteCounts[a.id] || 0)
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <h2 className="mb-4 text-lg font-semibold">Poll Options</h2>

      {!isActive && !userHasVoted && (
        <div className="p-3 mb-4 text-sm border border-yellow-100 rounded-lg bg-yellow-50">
          <div className="flex items-start gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5 mt-0.5 text-yellow-600 flex-shrink-0" />
            <p>This poll is not currently active or you don't have enough points to vote.</p>
          </div>
        </div>
      )}

      {sortedOptions.map((option, index) => {
        const percentage = calculatePercentage(option.id);
        const voteCount = optionVoteCounts[option.id] || 0;
        const isLeading = showResult && index === 0 && totalVotes > 0;

        // ✅ Fix: Check if the user voted for this option
        const isUserVote = userVotedOption.some((vote) => vote.optionId === option.id && vote.votes > 0);

        return (
          <motion.div
            key={option.id}
            whileHover={isActive && !userHasVoted && userPoint > 0 ? { scale: 1.01, y: -2 } : {}}
            transition={{ duration: 0.2 }}
            className={`relative ${isActive && !userHasVoted && userPoint > 0 ? "cursor-pointer" : ""}`}
            onClick={() => isActive && !userHasVoted && userPoint > 0 ? openVoteDialog(option.id) : null}
          >
            <Card 
              className={`p-4 relative overflow-hidden transition-all duration-300 
                ${isUserVote ? "border-2 border-green-500" : ""} 
                ${isLeading && showResult ? "border-2 border-blue-400" : ""}
                ${isActive && !userHasVoted && userPoint > 0 ? "hover:shadow-md" : ""}`
              }
            >
              {showResult && (
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-500 ${isLeading ? "bg-blue-100" : "bg-blue-50"}`}
                  style={{ width: `${percentage}%`, zIndex: 0 }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center flex-1 gap-3">
                  <Avatar className="w-10 h-10 overflow-hidden bg-gray-100 border rounded-full">
                    <AvatarImage src={option.banner} alt={option.text} className="object-cover w-full h-full" />
                    <AvatarFallback>{option.text.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="font-medium">{option.text}</div>
                    {option.description && (
                      <div className="mt-1 text-xs text-gray-500 line-clamp-1">{option.description}</div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-2">
                    {isUserVote && (
                      <Badge className="text-green-800 bg-green-100 border-0">
                        <Check className="w-3 h-3 mr-1" /> 
                        Your vote
                      </Badge>
                    )}
                    
                    {isLeading && showResult && (
                      <Badge className="text-blue-800 bg-blue-100 border-0">
                        Leading
                      </Badge>
                    )}
                  </div>
                </div>
                
                {showResult && (
                  <div className="flex flex-col items-end ml-4">
                    <span className="text-sm font-bold">{percentage}%</span>
                    <span className="text-xs text-gray-500">{voteCount} vote{voteCount !== 1 ? 's' : ''}</span>
                  </div>
                )}
                
                {isActive && !userHasVoted && userPoint > 0 && (
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}

      {userHasVoted && (
        <div className="p-3 mt-6 text-sm border border-green-100 rounded-lg bg-green-50">
          <div className="flex items-center gap-2 text-green-800">
            <Check className="w-5 h-5 text-green-600" />
            <p>Your vote has been recorded. Thank you for participating!</p>
          </div>
        </div>
      )}

      {!isActive && userPoint <= 0 && (
        <div className="p-3 mt-6 text-sm border border-gray-100 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 text-gray-600">
            <AlertCircle className="w-5 h-5 text-gray-500" />
            <p>You don't have any points remaining to vote in this poll.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollOptions;
