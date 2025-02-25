import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Check, Star } from "lucide-react";
import { IOption, IPoll } from "@/interfaces/interfaces";

interface ConfirmVoteDialogProps {
  isConfirmDialogOpen: boolean;
  poll: IPoll;
  remainingPoints: number;
  setIsConfirmDialogOpen: (open: boolean) => void;
  selectedOption: IOption | undefined;
  votingPoint: number;
  userPoint: number;
  handleVote: () => void;
}

const ConfirmVoteDialog: React.FC<ConfirmVoteDialogProps> = ({
  isConfirmDialogOpen,
  setIsConfirmDialogOpen,
  remainingPoints,
  selectedOption,
  votingPoint,
  userPoint,
  handleVote,
}) => {
  return (
    <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="mt-4 space-y-4">
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="font-medium">Selected Option:</p>
                <p className="mt-1 text-lg">{selectedOption?.text}</p>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50">
                <Star className="w-5 h-5 text-blue-600" />
                <p className="font-medium">Voting with {votingPoint} point{votingPoint !== 1 ? "s" : ""}</p>
              </div>
              <div className="p-3 text-sm text-gray-600 rounded-lg bg-amber-50">
                <p>This action cannot be undone. Your remaining points: {userPoint - remainingPoints}</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Go Back</AlertDialogCancel>
          <AlertDialogAction onClick={handleVote}>
            <Check className="w-4 h-4 mr-2" />
            Confirm Vote
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmVoteDialog;
