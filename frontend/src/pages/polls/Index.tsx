import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../hooks/UseAuth";
import { axiosInstance } from "@/lib/Utils";
import { IPoll } from "@/interfaces/interfaces";
import PollInfo from "./PollInfo";
import PollOptions from "./PollOptions";
import VoteSheet from "./VoteSheet";
import ConfirmVoteDialog from "./ConfirmVoteDialog";
import { ArrowLeft } from "lucide-react";

const PollDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ใช้สำหรับย้อนกลับ
  const { user } = useAuth();
  const [poll, setPoll] = useState<IPoll | null>(null);
  const [searchParams] = useSearchParams();
  const [selectedOption, setSelectedOption] = useState<string | null>(
    searchParams.get("selected") || null
  );

  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
  const [userPoint, setUserPoint] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [votingPoint, setVotingPoint] = useState<number>(1);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [optionVoteCounts, setOptionVoteCounts] = useState<Record<string, number>>({});
  const [userHasVoted, setUserHasVoted] = useState<boolean>(false);
  const [pollParticipantCount, setPollParticipantCount] = useState<number>(0);

  const [userVotedResults, setUserVotedResults] = useState<
    { optionId: string; userId: string; point: number }[]
  >([]);

  useEffect(() => {
    fetchPollData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPollData = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/polls/${id}`);
      const pollData = response.data.data.poll;
      
      setPoll(pollData);
      setUserVotedResults(response.data.data.userVotedResults);
      setPollParticipantCount(response.data.data.pollParticipantCount);
      setUserPoint(response.data.data.remainingPoints);
      
      const voteCounts: Record<string, number> = {};
      let total = 0;

      pollData.options.forEach((option: { id: string }) => {
        const voteCount = response.data.data.userVotedResults.find(
          (res: { optionId: string }) => res.optionId === option.id
        )?.votes || 0;

        voteCounts[option.id] = voteCount;
        total += voteCount;
      });

      setTotalVotes(total);
      setOptionVoteCounts(voteCounts);
      
      setUserHasVoted(
        response.data.data.userVotedResults.some(
          (result: { userId: string }) => result.userId === user?.id
        ) && userPoint == 0
      );


      console.log("has voted", userHasVoted);
      
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

      setOptionVoteCounts((prev) => ({
        ...prev,
        [selectedOption]: (prev[selectedOption] || 0) + votingPoint,
      }));
      setTotalVotes((prev) => prev + votingPoint);
      setUserPoint((prev) => prev - votingPoint);

      // Decrease user point
      
      setUserPoint((prev) => prev - votingPoint);

      fetchPollData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to cast vote");
    }
  };

  const isActive = !!(
    poll &&
    new Date() >= new Date(poll.startVoteAt) &&
    new Date() <= new Date(poll.endVoteAt)
  );

  const openVoteDialog = (optionId: string) => {
    if (!isActive || userPoint <= 0 || userHasVoted) return;
    setSelectedOption(optionId);
    setVotingPoint(1);
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

  return (
    <div className="max-w-4xl mx-auto md:py-8 md:px-4">
      {/* ปุ่มกลับ */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 mb-4 text-sm font-medium text-gray-700 transition bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        <ArrowLeft className="w-5 h-5" />
        กลับ
      </button>

      {/* Poll Info */}
      <PollInfo poll={poll} pollParticipantCount={pollParticipantCount} userPoint={userPoint} />

      <PollOptions
        pollOptions={poll.options}
        optionVoteCounts={optionVoteCounts}
        totalVotes={totalVotes}
        userVotedOption={userVotedResults}
        isActive={isActive}
        userHasVoted={userHasVoted}
        userPoint={userPoint}
        showResult={poll.showResult}
        openVoteDialog={openVoteDialog}
        canEdit={true}
      />

      {/* Voting Dialog */}
      <VoteSheet
        isVoteDialogOpen={isVoteDialogOpen}
        setIsVoteDialogOpen={setIsVoteDialogOpen}
        selectedOption={poll?.options?.find((opt) => opt.id === selectedOption)}
        poll={poll}
        userPoint={userPoint}
        votingPoint={votingPoint}
        setVotingPoint={setVotingPoint}
        openConfirmDialog={() => setIsConfirmDialogOpen(true)}
        userHasVoted={userHasVoted}
      />

      {/* Confirm Vote Dialog */}
      <ConfirmVoteDialog
        isConfirmDialogOpen={isConfirmDialogOpen}
        setIsConfirmDialogOpen={setIsConfirmDialogOpen}
        selectedOption={poll?.options?.find((opt) => opt.id === selectedOption)}
        votingPoint={votingPoint}
        userPoint={userPoint}
        poll={poll}
        remainingPoints={userPoint - votingPoint}
        handleVote={handleVote}
      />
    </div>
  );
};

export default PollDetails;
