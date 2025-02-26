import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '@/lib/Utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CalendarIcon, UserIcon, ClockIcon, EyeIcon, BarChart2 } from 'lucide-react';
import { IPoll } from '@/interfaces/interfaces';

const COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EF4444'];

const PollResult = () => {
  const { id } = useParams();
  const [poll, setPoll] = useState<IPoll | null>();
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchPollData = async () => {
    try {
      const response = await axiosInstance.get(`/polls/${id}/result`);
      const pollData = response.data.data;
      setPoll(pollData.poll);
      setTotalVotes(pollData.options.reduce((sum, opt) => sum + opt.count, 0));
    } catch (error) {
      toast.error('Failed to load poll data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPollData(); // ดึงข้อมูลครั้งแรก
  
      const interval = setInterval(() => {
        fetchPollData();
      }, 5000); // ดึงข้อมูลทุก 1 วินาที
  
      return () => clearInterval(interval); // เคลียร์ interval เมื่อ component ถูก unmount
    }
  }, [id]);
  

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 animate-spin text-indigo-500 text-3xl">⏳</div>;
  }

  if (!poll) {
    return <div className="text-center text-gray-500 text-lg">No poll data available</div>;
  }

  const chartData = poll.options.map((option, index) => ({
    name: option.text,
    votes: option._count.votes || 0,
  }));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        {poll.banner && (
          <div className="relative h-48 w-full">
            <img src={poll.banner} alt="Poll Banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <h1 className="text-2xl font-bold">{poll.question}</h1>
            </div>
          </div>
        )}
        <div className="p-6">
          {!poll.banner && <h1 className="text-2xl font-bold text-gray-800 mb-4">{poll.question}</h1>}
          <p className="text-gray-600 mb-4">{poll.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-500">
            <div className="flex items-center"><CalendarIcon size={16} className="mr-2 text-indigo-500" /> {new Date(poll.createdAt).toLocaleDateString()}</div>
            <div className="flex items-center"><ClockIcon size={16} className="mr-2 text-indigo-500" /> Ends: {new Date(poll.endVoteAt).toLocaleDateString()}</div>
            <div className="flex items-center"><UserIcon size={16} className="mr-2 text-indigo-500" /> By: {poll.event?.name || 'Unknown'}</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center"><BarChart2 size={20} className="mr-2 text-indigo-500" /> Poll Results</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#374151', fontSize: 14 }} />
            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.1)' }} />
            <Bar dataKey="votes" fill="#6366F1" barSize={30} radius={[5, 5, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-gray-500 text-center mt-4">Total Votes: {totalVotes}</p>
      </div>
    </div>
  );
};

export default PollResult;