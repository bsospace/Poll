import React, { useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MinusCircle, PlusCircle, Info, Lock } from "lucide-react";
import { IOption, IPoll } from "@/interfaces/interfaces";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VoteSheetProps {
  isVoteDialogOpen: boolean;
  setIsVoteDialogOpen: (open: boolean) => void;
  selectedOption: IOption | undefined;
  poll: IPoll;
  userPoint: number;
  votingPoint: number;
  setVotingPoint: (points: number) => void;
  openConfirmDialog: () => void;
  userHasVoted: boolean;
}

const VoteSheet: React.FC<VoteSheetProps> = ({
  isVoteDialogOpen,
  setIsVoteDialogOpen,
  selectedOption,
  poll,
  userPoint,
  votingPoint,
  setVotingPoint,
  openConfirmDialog,
  userHasVoted,
}) => {
  useEffect(() => {
    if (poll.isPublic) setVotingPoint(1);
  }, [poll.isPublic, setVotingPoint]);

  const isVoteLocked = userHasVoted && !poll.canEdit;

  if (!selectedOption) return null;

  return (
    <Sheet open={isVoteDialogOpen} onOpenChange={setIsVoteDialogOpen}>
      <SheetContent side="bottom" className="shadow-lg h-[70vh] rounded-t-xl overflow-y-auto">
        <SheetHeader className="mb-2">
          <SheetTitle>{isVoteLocked ? "Voting Locked" : "Cast Your Vote"}</SheetTitle>
        </SheetHeader>

        <div className="py-2 space-y-4">
          {/* Poll Title & Description */}
          <div className="p-3 border rounded-lg bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-800">{poll.question}</h3>
            {poll.description && (
              <p className="mt-1 text-xs text-gray-600">{poll.description}</p>
            )}
          </div>

          {/* Option Card */}
          <div className="p-3 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border rounded-full">
                <AvatarImage src={selectedOption.banner} alt={selectedOption.text} className="object-cover" />
                <AvatarFallback>{selectedOption.text.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <h3 className="font-medium truncate">{selectedOption.text}</h3>
                {selectedOption.description && (
                  <p className="text-xs text-gray-500 truncate">{selectedOption.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Lock Message */}
          {isVoteLocked && (
            <div className="p-2 text-xs border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center gap-1 text-red-800">
                <Lock className="w-4 h-4" />
                <p>You have already voted and this poll cannot be edited</p>
              </div>
            </div>
          )}

          {/* Voting Points Selector (for non-public polls) */}
          {!poll.isPublic && !isVoteLocked && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="flex items-center text-xs font-medium">
                  Voting Points
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3 h-3 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">More points = stronger influence</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <span className="text-xs text-gray-500">{userPoint} available</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => votingPoint > 1 && setVotingPoint(votingPoint - 1)}
                  disabled={votingPoint <= 1}
                  className="w-8 h-8 p-0 rounded-full"
                >
                  <MinusCircle className="w-4 h-4" />
                </Button>

                <span className="text-base font-semibold">{votingPoint}</span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => votingPoint < userPoint && setVotingPoint(votingPoint + 1)}
                  disabled={votingPoint >= userPoint}
                  className="w-8 h-8 p-0 rounded-full"
                >
                  <PlusCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" className="w-1/2 text-sm h-9" onClick={() => setIsVoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="w-1/2 text-sm h-9" onClick={openConfirmDialog} disabled={isVoteLocked}>
              Confirm Vote
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default VoteSheet;
