import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { axiosInstance } from '@/lib/Utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  ArrowLeft,
  BarChart2,
  RefreshCw,
  Share2,
  Download,
  Loader2,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

// Improved type definitions
interface PollOption {
  id: string;
  text: string;
  banner: string;
  description: string;
  pollId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  dataLogs: unknown;
  _count: {
    votes: number;
  };
}

interface Event {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Poll {
  id: string;
  eventId: string;
  userId: string;
  question: string;
  description: string;
  isPublic: boolean;
  canEdit: boolean;
  showResult: boolean;
  startVoteAt: string;
  endVoteAt: string;
  isVoteEnd: boolean;
  banner: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  options: PollOption[];
  event: Event;
}

interface PollResultOption {
  optionId: string;
  count: number;
  percentage: number;
}

interface PollResultData {
  poll: Poll;
  options: PollResultOption[];
}

interface ChartDataItem {
  name: string;
  votes: number;
  fill: string;
  total: number;
  optionId: string;
}

// Custom tooltip component with TypeScript support
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataItem;
  }>;
}

const COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#2563EB', '#84CC16'];

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = ((data.votes / data.total) * 100).toFixed(1);

    return (
      <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-gray-600">Votes: <span className="font-medium">{data.votes}</span></p>
        <p className="text-sm text-gray-600">Percentage: <span className="font-medium">{percentage}%</span></p>
      </div>
    );
  }
  return null;
};

const PollResult: React.FC = () => {
  const { id, eventId } = useParams<{ id: string; eventId: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('chart');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [embedLink, setEmbedLink] = useState<string>("");

  const fetchPollData = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);

    try {
      if (!id) return;

      const response = await axiosInstance.get<{ success: boolean; message: string; data: PollResultData }>(`/polls/${id}/result`);
      const pollData = response.data.data;
      setPoll(pollData.poll);

      const total = pollData.options.reduce((sum, opt) => sum + opt.count, 0);
      setTotalVotes(total);
      setLastUpdated(new Date());
      setEmbedLink(`${window.location.origin}/embed/poll/${id}`);
    } catch (error) {
      toast.error('Failed to load poll data');
      console.error('Error fetching poll data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedLink)
      .then(() => alert('Embed link copied!'))
      .catch(() => alert('Failed to copy link'));
  };

  useEffect(() => {
    if (id) {
      fetchPollData();

      let interval: NodeJS.Timeout | null = null;

      if (autoRefresh) {
        interval = setInterval(() => {
          fetchPollData();
        }, 5000);
      }

      return () => {
        if (interval) clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, autoRefresh]);

  const handleManualRefresh = () => {
    fetchPollData(true);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  const formatTimeLeft = (endTime: string): string => {
    const timeLeft = new Date(endTime).getTime() - new Date().getTime();
    if (timeLeft <= 0) return 'Ended';

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: poll?.question || 'Poll Results',
        url: window.location.href
      }).catch(err => {
        console.error('Error sharing:', err);
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  };

  const copyEmbedLink = () => {
    navigator.clipboard.writeText(embedLink)
      .then(() => toast.success('Embed link copied!'))
      .catch(() => toast.error('Failed to copy embed link'));
  };


  if (isLoading) {
    return (
      <div className="max-w-4xl p-4 mx-auto space-y-6 md:p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="text-gray-500">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="w-3/4 h-8 mb-2" />
            <Skeleton className="w-1/2 h-4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3">
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-full h-6" />
                <Skeleton className="w-full h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="w-40 h-7" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="max-w-4xl p-6 mx-auto">
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center justify-center">
            <BarChart2 className="w-12 h-12 mb-4 text-gray-300" />
            <h2 className="mb-2 text-xl font-medium text-gray-700">No poll data available</h2>
            <p className="mb-6 text-gray-500">The poll you're looking for might have been deleted or is not available</p>
            <Link to={`/event/${eventId}`}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Event
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const chartData: ChartDataItem[] = poll.options.map((option, index) => ({
    name: option.text,
    votes: option._count?.votes || 0,
    fill: COLORS[index % COLORS.length],
    total: totalVotes,
    optionId: option.id
  }));

  // Sort data by votes (descending)
  chartData.sort((a, b) => b.votes - a.votes);

  const isActive = new Date() < new Date(poll.endVoteAt);

  return (
    <div className="max-w-4xl p-4 mx-auto space-y-6 md:p-6">
      <div className="flex items-center justify-between mb-2">
        <Link to={`/events`} className="flex items-center text-gray-600 transition-colors hover:text-indigo-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Event
        </Link>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAutoRefresh}
                  className={autoRefresh ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : ""}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? "animate-spin animate-once animate-duration-1000 animate-delay-0 animate-ease-in-out" : ""}`} />
                  {autoRefresh ? "Auto" : "Manual"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {autoRefresh ? "Auto refresh is on (every 5s)" : "Switch to automatic refresh"}
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={handleShareClick}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border shadow-lg">
        {poll.banner && (
          <div className="relative w-full h-48 md:h-64 bg-gradient-to-br from-indigo-600 to-purple-600">
            <img src={poll.banner} alt="Poll Banner" className="object-cover w-full h-full opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute text-white bottom-4 left-6 right-6">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className={isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}>
                  {isActive ? "Active" : "Ended"}
                </Badge>
                {isActive && (
                  <Badge variant="outline" className="text-white border-white/30 bg-white/10">
                    {formatTimeLeft(poll.endVoteAt)}
                  </Badge>
                )}
              </div>
              <h1 className="mt-2 text-2xl font-bold md:text-3xl drop-shadow-md">{poll.question}</h1>
            </div>
          </div>
        )}

        <CardContent className={poll.banner ? "pt-6" : "pt-4"}>
          {!poll.banner && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={isActive ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}>
                  {isActive ? "Active" : "Ended"}
                </Badge>
                {isActive && (
                  <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                    {formatTimeLeft(poll.endVoteAt)}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-800">{poll.question}</h1>
            </div>
          )}

          {poll.description && (
            <p className="mb-4 leading-relaxed text-gray-600">{poll.description}</p>
          )}

          <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600 md:grid-cols-3">
            <div className="flex items-center">
              <CalendarIcon size={16} className="mr-2 text-indigo-500" />
              Created: {new Date(poll.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <ClockIcon size={16} className="mr-2 text-indigo-500" />
              {isActive ? "Ends" : "Ended"}: {new Date(poll.endVoteAt).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <UserIcon size={16} className="mr-2 text-indigo-500" />
              By: {poll.event?.name || 'Unknown'}
            </div>
          </div>

          {lastUpdated && (
            <div className="flex items-center justify-end mt-4 text-xs text-gray-500">
              <Info size={12} className="mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="flex items-center text-xl">
              <BarChart2 size={20} className="mr-2 text-indigo-500" />
              Poll Results
            </CardTitle>
            {totalVotes > 0 && (
              <CardDescription className="mt-1">
                Based on {totalVotes} {totalVotes === 1 ? 'response' : 'responses'}
              </CardDescription>
            )}
          </div>
          {totalVotes > 0 && (
            <Badge variant="outline" className="ml-2">
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </Badge>
          )}
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="space-y-4">
              {totalVotes > 0 ? (
                <div className="transition-all duration-300 ease-in-out">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 20, right: 50, left: 20, bottom: 5 }}
                    >
                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value}`}
                        domain={[0, 'dataMax']}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={150}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#374151', fontSize: 14 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="votes"
                        barSize={24}
                        radius={[0, 4, 4, 0]}
                        animationDuration={500}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <LabelList
                          dataKey="votes"
                          position="right"
                          style={{ fill: '#4B5563', fontWeight: 'bold', fontSize: '14px' }}
                          formatter={(value: number) => `${value} (${((value / totalVotes) * 100).toFixed(1)}%)`}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-3 mb-4 rounded-full bg-indigo-50">
                    <BarChart2 className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium text-gray-700">No votes yet</h3>
                  <p className="max-w-md mb-6 text-gray-500">Be the first to vote or share this poll with others to get responses</p>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleShareClick}>
                    <Share2 className="w-4 h-4" />
                    Share Poll
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="list">
              {totalVotes > 0 ? (
                <div className="space-y-4">
                  {chartData.map((option) => {
                    const percentage = ((option.votes / totalVotes) * 100).toFixed(1);
                    return (
                      <div key={option.optionId} className="relative transition-all duration-300">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-gray-700">{option.name}</span>
                          <span className="text-gray-600">
                            {option.votes} {option.votes === 1 ? 'vote' : 'votes'} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-6 overflow-hidden bg-gray-100 rounded-lg">
                          <div
                            className="flex items-center h-full pl-2 text-sm font-medium text-white transition-all duration-500 ease-out rounded-lg"
                            style={{
                              width: `${Math.max(parseFloat(percentage), 5)}%`,
                              backgroundColor: option.fill
                            }}
                          >
                            {percentage}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-3 mb-4 rounded-full bg-indigo-50">
                    <BarChart2 className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium text-gray-700">No votes yet</h3>
                  <p className="max-w-md mb-6 text-gray-500">Be the first to vote or share this poll with others to get responses</p>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleShareClick}>
                    <Share2 className="w-4 h-4" />
                    Share Poll
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {totalVotes > 0 && (
            <div className="flex justify-end gap-4 mt-6">
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export Results
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Download poll results as CSV
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
              <Button variant="outline" size="sm" onClick={copyEmbedLink}>
                <Share2 className="w-4 h-4 mr-2" />
                Copy Embed Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PollResult;