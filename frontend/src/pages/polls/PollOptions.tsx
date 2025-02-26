import React from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IOption } from "@/interfaces/interfaces";
import { toast } from "react-hot-toast";

interface PollOptionsProps {
  pollOptions: IOption[];
  optionVoteCounts: Record<string, number>;
  totalVotes: number;
  userVotedOption: { optionId: string; userId: string; point: number }[];
  isActive: boolean;
  userHasVoted: boolean;
  showResult: boolean;
  openVoteDialog: (optionId: string) => void;
  userPoint: number;
  canEdit: boolean;
}

const PollOptions: React.FC<PollOptionsProps> = ({
  pollOptions,
  optionVoteCounts,
  totalVotes,
  userVotedOption,
  isActive,
  userHasVoted,
  showResult,
  openVoteDialog,
  userPoint,
  canEdit,
}) => {
  const calculatePercentage = (optionId: string) => {
    if (totalVotes === 0) return 0;
    return Math.round(((optionVoteCounts[optionId] || 0) / totalVotes) * 100);
  };

  // เรียงตัวเลือกตามคะแนนโหวต
  const sortedOptions = [...pollOptions];
  if (showResult) {
    sortedOptions.sort((a, b) => (optionVoteCounts[b.id] || 0) - (optionVoteCounts[a.id] || 0));
  }

  console.log("🔍 isActive:", isActive);
  console.log("🎯 userPoint:", userPoint);
  console.log("🗳 userHasVoted:", userHasVoted);
  console.log("✏️ canEdit:", canEdit);
  console.log("📊 userVotedOption:", userVotedOption);

  return (
    <div className="mt-4 space-y-4">
      <h2 className="mb-4 text-lg font-semibold">Poll Options</h2>

      {!isActive && !userHasVoted && (
        <div className="p-3 mb-4 text-sm border border-orange-100 rounded-lg bg-orange-50">
          <div className="flex items-start gap-2 text-orange-800">
            <AlertCircle className="w-5 h-5 mt-0.5 text-orange-600 flex-shrink-0" />
            <p>This poll is not currently active or you don't have enough points to vote.</p>
          </div>
        </div>
      )}

      {sortedOptions.map((option, index) => {
        const percentage = calculatePercentage(option.id);
        const voteCount = optionVoteCounts[option.id] || 0;
        const isLeading = showResult && index === 0 && totalVotes > 0;

        //  ตรวจสอบว่าผู้ใช้เคยโหวตตัวเลือกนี้หรือไม่
        const userVote = userVotedOption.find((vote) => vote.optionId === option.id);
        const isUserVote = userVote && userVote.point > 0;
        const userVotePoints = userVote ? userVote.point : 0;

        //  ถ้า `canEdit === false` และเคยโหวตตัวเลือกนี้ → ห้ามเลือกซ้ำ
        const isOptionDisabled = !canEdit && isUserVote;

        return (
          <motion.div
            key={option.id}
            whileHover={isActive && userPoint > 0 && !isOptionDisabled ? { scale: 1.01, y: -2 } : {}}
            transition={{ duration: 0.2 }}
            className={`relative ${
              isActive && userPoint > 0 && !isOptionDisabled ? "cursor-pointer" : "opacity-50 cursor-not-allowed"
            }`}
            onClick={() => {
              if (!isActive) {
                toast.error("Voting is not open.");
                return;
              }
              if (userPoint <= 0) {
                toast.error("You have no voting points left.");
                return;
              }
              if (isOptionDisabled) {
                toast.error("You cannot vote for the same option again.");
                return;
              }
              openVoteDialog(option.id);
            }}
          >
            <Card
              className={`p-4 relative overflow-hidden transition-all duration-300 
                ${isUserVote ? "border-2 border-orange-500" : ""} 
                ${isLeading && showResult ? "border-2 border-orange-400" : ""}
                ${isActive && userPoint > 0 && !isOptionDisabled ? "hover:shadow-md" : ""}`}
            >
              {showResult && (
                <div
                  className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                    isLeading ? "bg-orange-100" : "bg-orange-50"
                  }`}
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
                      <Badge className="text-orange-800 bg-orange-100 border-0">
                        <Check className="w-3 h-3 mr-1" />
                        Your vote {userVotePoints ? `(${userVotePoints} points)` : ""}
                      </Badge>
                    )}

                    {isLeading && showResult && <Badge className="text-orange-800 bg-orange-100 border-0">Leading</Badge>}
                  </div>
                </div>

                {showResult && (
                  <div className="flex flex-col items-end ml-4">
                    <span className="text-sm font-bold">{percentage}%</span>
                    <span className="text-xs text-gray-500">
                      {voteCount} vote{voteCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {isActive && userPoint > 0 && !isOptionDisabled && (
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-400" />
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PollOptions;