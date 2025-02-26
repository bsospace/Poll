import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '@/lib/Utils';
import { IPoll, IOption } from '@/interfaces/interfaces';

const PollResult = () => {
  const { id } = useParams();
  const [poll, setPoll] = useState<IPoll | null>(null);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [optionVoteCounts, setOptionVoteCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchPollData = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/polls/${id}`);
      const pollData = response.data.data;
      setPoll(pollData);
      const voteCounts: Record<string, number> = {};
      let total = 0;

      pollData.poll.options.forEach((option: IOption) => {
        const voteCount = response.data.userVotedResults?.find(
          (res: { optionId: string }) => res.optionId === option.id
        )?.votes.length || 0; // ใช้ optional chaining

        voteCounts[option.id] = voteCount;
        total += voteCount;
      });

      setTotalVotes(total);
      setOptionVoteCounts(voteCounts);
    } catch (error) {
      toast.error('Failed to load poll data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPollData();
    }
  }, [id]);

  if (!poll) {
    return <p>No poll data available</p>;
  }

  console.log('poll', poll);

  return (
    <div className="max-w-4xl mx-auto md:py-8 md:px-4">
      <div className="poll-header">
        <h1>{poll.poll.question}</h1>
        <p>{poll.poll.description}</p>
        {poll.banner && <img src={poll.poll.banner} alt="Poll Banner" className="poll-banner" />}
      </div>

      <div className="options-container">
        {poll.poll.options?.map((option) => (
          <div className="poll-option" key={option.id}>
            {option.banner && (
              <img src={poll.poll.banner}className="option-banner" />
            )}
            <h2>{option.text}</h2>
            {option.description && <p><strong>Description:</strong> {option.description}</p>}
            {option.points !== undefined && <p><strong>Points:</strong> {option.points}</p>}
            <p><strong>Votes:</strong> {poll.poll.userVotedResults || 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PollResult;
