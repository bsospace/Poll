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
  // If the poll is public, set a fixed voting point of 1
  useEffect(() => {
    if (poll.isPublic) {
      setVotingPoint(1);
    }
  }, [poll.isPublic, setVotingPoint]);

  const isVoteLocked = userHasVoted && !poll.canEdit;

  const handleIncrement = () => {
    if (!poll.isPublic && votingPoint < userPoint && !isVoteLocked) {
      setVotingPoint(votingPoint + 1);
    }
  };

  const handleDecrement = () => {
    if (!poll.isPublic && votingPoint > 1 && !isVoteLocked) {
      setVotingPoint(votingPoint - 1);
    }
  };

  return (
    <Sheet open={isVoteDialogOpen} onOpenChange={setIsVoteDialogOpen}>
      <SheetContent side="bottom" className="shadow-lg h-[85vh] md:h-[75vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{isVoteLocked ? "Voting Locked" : "Cast Your Vote"}</SheetTitle>
        </SheetHeader>

        {selectedOption && (
          <div className="py-6">
            {/* Option Details */}
            <div className="p-4 mb-6 rounded-lg bg-gray-50">
              <div className="flex items-center gap-4">
                <Avatar className="overflow-hidden border rounded-full w-14 h-14">
                  <AvatarImage src={selectedOption.banner} alt={selectedOption.text} className="object-cover w-full h-full" />
                  <AvatarFallback>{selectedOption.text.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedOption.text}</h3>
                  {selectedOption.description && (
                    <p className="text-sm text-gray-500">{selectedOption.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Lock Message if Editing is Disabled */}
            {isVoteLocked && (
              <div className="p-3 mb-6 text-sm text-center border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center justify-center gap-2 text-red-800">
                  <Lock className="w-5 h-5" />
                  <p>You have already voted and this poll cannot be edited.</p>
                </div>
              </div>
            )}

            {/* Hide Voting Points & Slider for Public Polls */}
            {!poll.isPublic && !isVoteLocked && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    Voting Points
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="inline w-4 h-4 ml-1 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Allocate more points to have a stronger influence on the results</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <span className="text-sm text-gray-500">{userPoint} available</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDecrement}
                    disabled={votingPoint <= 1 || isVoteLocked}
                    className="p-0 rounded-full w-9 h-9"
                  >
                    <MinusCircle className="w-5 h-5" />
                  </Button>

                  <span className="text-lg font-semibold">{votingPoint}</span>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleIncrement}
                    disabled={votingPoint >= userPoint || isVoteLocked}
                    className="p-0 rounded-full w-9 h-9"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Voting Summary */}
            <div className={`p-3 mb-6 text-sm border rounded-lg ${isVoteLocked ? "bg-gray-50 border-gray-200 text-gray-600" : "bg-blue-50 border-blue-100 text-blue-800"}`}>
              <p>
                You're voting with <strong>{votingPoint}</strong> point.
                {poll.isPublic ? " (Public poll: Fixed to 1 point)" : ` You'll have ${userPoint - votingPoint} points remaining.`}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 md:flex-row md:justify-end">
              <Button variant="outline" className="w-full md:w-auto" onClick={() => setIsVoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="w-full md:w-auto" onClick={openConfirmDialog} disabled={isVoteLocked}>
                Confirm Vote
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default VoteSheet;
