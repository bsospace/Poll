import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Calendar, Clock, Users, Star, Check, Plus, Minus, ArrowLeft, Info } from "lucide-react";
import { useAuth } from "../hooks/UseAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { axiosInstance } from "@/lib/Utils";
import { IPoll } from "@/interfaces/interfaces";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Progress
} from "@/components/ui/progress";

const PollDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [poll, setPoll] = useState<IPoll>();
  const [searchParams] = useSearchParams();
  const [selectedOption, setSelectedOption] = useState<string>(
    searchParams.get("option") || ""
  );

  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
  const [userPoint, setUserPoint] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [votingPoint, setVotingPoint] = useState<number>(1);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [optionVoteCounts, setOptionVoteCounts] = useState<Record<string, number>>({});
  const [userHasVoted, setUserHasVoted] = useState<boolean>(false);
  const [userVotedOption, setUserVotedOption] = useState<string | null>(null);

  useEffect(() => {
    fetchPollData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPollData = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/polls/${id}`);
      setPoll(response.data.data);

      // Find user in the whitelist
      const userWhitelist = response.data.data.event.whitelist.find(
        (item: { userId: string }) => item.userId === user?.id
      );
      setUserPoint(userWhitelist?.point || 0);

      // Calculate total votes and option percentages (mock for now)
      // In a real app, this would come from the API
      const mockVoteCounts: Record<string, number> = {};
      let mockTotalVotes = 0;

      response.data.data.options.forEach((option: {
        id: string;
        text: string;
      }) => {
        // Random vote count for demo
        const voteCount = Math.floor(Math.random() * 50);
        mockVoteCounts[option.id] = voteCount;
        mockTotalVotes += voteCount;
      });

      setTotalVotes(mockTotalVotes);
      setOptionVoteCounts(mockVoteCounts);

      // Check if user has already voted
      // This is a mock implementation - would need real API data
      const hasVoted = false; // Would be from API
      setUserHasVoted(hasVoted);
      if (hasVoted) {
        setUserVotedOption(response.data.data.options[0].id); // Mock data
      }

    } catch (error) {
      toast.error("Failed to load poll data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !user || votingPoint < 1) return;

    try {
      await axiosInstance.post(`/polls/${id}/vote`, {
        optionId: selectedOption,
        userId: user.id,
        point: votingPoint,
      });

      toast.success("Vote cast successfully!");
      setIsVoteDialogOpen(false);
      setIsConfirmDialogOpen(false);
      setUserHasVoted(true);
      setUserVotedOption(selectedOption);

      // Update local state to reflect vote
      setOptionVoteCounts(prev => ({
        ...prev,
        [selectedOption]: (prev[selectedOption] || 0) + votingPoint
      }));
      setTotalVotes(prev => prev + votingPoint);
      setUserPoint(prev => prev - votingPoint);

      fetchPollData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to cast vote");
    }
  };

  const isActive =
    poll &&
    new Date() >= new Date(poll.startVoteAt) &&
    new Date() <= new Date(poll.endVoteAt);

  const getTimeRemaining = () => {
    if (!poll) return null;

    const now = new Date();
    const end = new Date(poll.endVoteAt);

    if (now > end) {
      return "Poll has ended";
    }

    const start = new Date(poll.startVoteAt);
    if (now < start) {
      const diffTime = Math.abs(start.getTime() - now.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (diffDays > 0) {
        return `Starts in ${diffDays} day${diffDays > 1 ? 's' : ''} and ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      } else {
        return `Starts in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      }
    }

    const diffTime = Math.abs(end.getTime() - now.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} and ${diffHours} hour${diffHours > 1 ? 's' : ''} remaining`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} remaining`;
    }
  };

  const calculatePercentage = (optionId: string) => {
    if (totalVotes === 0) return 0;
    return Math.round((optionVoteCounts[optionId] || 0) / totalVotes * 100);
  };

  const openVoteDialog = (optionId: string) => {
    if (!isActive || userPoint <= 0 || userHasVoted) return;
    setSelectedOption(optionId);
    setVotingPoint(1); // Reset to 1 point
    setIsVoteDialogOpen(true);
  };

  useEffect(() => {
    const optionFromQuery = searchParams.get("option");
    if (optionFromQuery) {
      setSelectedOption(optionFromQuery);
      setIsVoteDialogOpen(true);
    }
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 border-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!poll) return null;

  const selectedOptionData = poll.options?.find(
    (opt) => opt.id === selectedOption
  );

  const timeRemainingText = getTimeRemaining();
  const eventName = poll.event?.name || "Event";

  return (
    <div className="max-w-4xl mx-auto md:py-8 md:px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Breadcrumb and event name */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-1 text-gray-600 hover:text-gray-900"
          >
            <Link to="/"><ArrowLeft className="w-4 h-4" /> Back to Polls</Link>
          </Button>
          <span className="mx-2 text-gray-300">|</span>
          <Badge variant="outline" className="text-blue-600 bg-blue-50">
            {eventName}
          </Badge>
        </div>

        <Card className="p-6 overflow-hidden shadow-lg">
          {/* Status banner */}
          <div className={`px-4 py-2 -mx-6 -mt-6 mb-6 text-center text-white ${!isActive
            ? (new Date() < new Date(poll.startVoteAt) ? "bg-amber-500" : "bg-gray-500")
            : "bg-green-500"
            }`}>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{timeRemainingText}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{poll.question}</h1>
              <p className="mt-2 text-gray-600">{poll.description}</p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Start: {new Date(poll.startVoteAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                End: {new Date(poll.endVoteAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
              </div>
              {userPoint > 0 && (
                <div className="flex items-center gap-1 ml-auto">
                  <Star className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{userPoint} points available</span>
                </div>
              )}
            </div>

            {/* User has already voted message */}
            {userHasVoted && (
              <div className="p-4 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <p className="font-medium">You've already voted in this poll</p>
                </div>
              </div>
            )}

            {/* Poll options */}
            <div className="mt-6 space-y-4">
              {poll?.options?.map((option) => {
                const percentage = calculatePercentage(option.id);
                const isUserVote = userVotedOption === option.id;

                return (
                  <motion.div
                    key={option.id}
                    whileHover={isActive && !userHasVoted && userPoint > 0 ? { scale: 1.01 } : {}}
                    className={`relative ${isActive && !userHasVoted && userPoint > 0 ? "cursor-pointer" : ""
                      }`}
                    onClick={() => openVoteDialog(option.id)}
                  >
                    <Card
                      className={`p-4 relative overflow-hidden ${isUserVote ? "border-2 border-green-500" : ""
                        }`}
                    >
                      {/* Progress bar background */}
                      {
                        poll.showResult && (
                          <div
                            className="absolute top-0 left-0 h-full transition-all duration-500 bg-blue-50"
                            style={{ width: `${percentage}%`, zIndex: 0 }}
                          />
                        )
                      }

                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 overflow-hidden border rounded-full">
                            <AvatarImage
                              src={option.banner}
                              alt={option.text}
                              className="object-cover w-full h-full"
                            />
                            <AvatarFallback>{option.text.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{option.text}</span>
                          {isUserVote && (
                            <Badge className="ml-2 text-green-800 bg-green-100 border-green-200">
                              Your vote
                            </Badge>
                          )}
                        </div>
                        {
                          poll.showResult &&
                          <div
                            className="absolute top-0 left-0 h-full transition-all duration-500 bg-blue-50"
                            style={{ width: `${percentage}%`, zIndex: 0 }}
                          />
                        }
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Poll eligibility messages */}
          {isActive && userPoint === 0 && !poll.isPublic && !userHasVoted && (
            <div className="p-4 mt-6 text-center rounded-lg text-amber-600 bg-amber-50">
              <div className="flex items-center justify-center gap-2">
                <Info className="w-5 h-5" />
                <p>You are not eligible to vote in this poll</p>
              </div>
            </div>
          )}

          {!isActive && !userHasVoted && (
            <div className="p-4 mt-6 text-center bg-gray-100 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <Info className="w-5 h-5 text-gray-500" />
                <p className="text-gray-700">
                  {new Date() < new Date(poll.startVoteAt)
                    ? "This poll has not started yet"
                    : "This poll has ended"}
                </p>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Vote Sheet */}
      <Sheet open={isVoteDialogOpen} onOpenChange={setIsVoteDialogOpen}>
        <SheetContent side="bottom" className="h-full shadow-lg md:h-3/4 rounded-t-2xl">
          <div className="flex flex-col h-full p-4">
            <SheetHeader className="text-left">
              <div className="relative flex flex-col items-center p-2 rounded-lg">
                <h1 className="mb-4 text-2xl font-bold">
                  {
                    poll?.question
                  }
                </h1>
                <Avatar className="w-20 h-20 overflow-hidden border-4 border-white rounded-full shadow-lg">
                  <AvatarImage
                    src={selectedOptionData?.banner}
                    alt={selectedOptionData?.text || "Option Image"}
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback>{selectedOptionData?.text?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl font-bold text-center">
                  {selectedOptionData?.text}
                </h2>
              </div>
            </SheetHeader>

            <div className="flex-grow py-6 space-y-6 overflow-auto">
              {/* Event Points */}
              <div className="p-6 bg-white border rounded-lg shadow-md">
                <h3 className="mb-2 font-medium text-gray-700">
                  Event Points Available
                </h3>
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-blue-600" />
                  <span className="text-xl font-bold">{userPoint} points</span>
                </div>
              </div>

              {/* Adjust Voting Power */}
              <div className="p-6 bg-white border rounded-lg shadow-md">
                <h3 className="mb-3 font-medium text-gray-700">
                  Adjust Voting Power
                </h3>
                <div className="flex items-center justify-between gap-4 p-4 bg-gray-100 rounded-md">
                  <Button
                    variant="outline"
                    size="icon"
                    className="shadow"
                    onClick={() => setVotingPoint(Math.max(1, votingPoint - 1))}
                    disabled={votingPoint <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </Button>

                  <div className="flex items-center gap-3">
                    <Star className="w-6 h-6 text-blue-600" />
                    <span className="text-2xl font-bold">{votingPoint}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="shadow"
                    onClick={() => setVotingPoint(Math.min(userPoint, votingPoint + 1))}
                    disabled={votingPoint >= userPoint}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>

                <div className="mt-4">
                  <Progress value={(votingPoint / userPoint) * 100} className="h-2" />
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>Min: 1</span>
                    <span>Max: {userPoint}</span>
                  </div>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 mt-4 text-sm text-gray-600">
                        <Info className="w-4 h-4" />
                        <span>What are voting points?</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p>Voting points represent your influence in this poll. More points means your vote carries more weight in the final results.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <SheetFooter className="pt-4 border-t">
              <div className="flex w-full gap-4">
                <Button
                  variant="outline"
                  className="flex-1 shadow-md"
                  onClick={() => setIsVoteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  className="flex-1 text-white"
                  onClick={() => setIsConfirmDialogOpen(true)}
                >
                  Continue
                </Button>
              </div>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
      {/* desktop make it's modal */}
      

      {/* Confirm Dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Vote</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="mt-4 space-y-4">
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="font-medium">Selected Option:</p>
                  <p className="mt-1 text-lg">{selectedOptionData?.text}</p>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50">
                  <Star className="w-5 h-5 text-blue-600" />
                  <p className="font-medium">
                    Voting with {votingPoint} point{votingPoint !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="p-3 text-sm text-gray-600 rounded-lg bg-amber-50">
                  <p>This action cannot be undone. Your remaining points: {userPoint - votingPoint}</p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVote}
            >
              <Check className="w-4 h-4 mr-2" />
              Confirm Vote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PollDetails;