import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Student } from '@/types/student';
import { getCodeforcesRatingTitle, formatRating } from '@/utils/codeforcesApi';
import { generateMockContests, generateMockSubmissions } from '@/utils/mockData';
import { ArrowLeft, Calendar, Trophy, Code, TrendingUp, ExternalLink } from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack }) => {
  const [contestFilter, setContestFilter] = useState('30');
  const [problemFilter, setProblemFilter] = useState('30');
  
  const contests = generateMockContests(student.codeforcesHandle);
  const submissions = generateMockSubmissions(student.codeforcesHandle);

  const openCodeforcesProfile = (handle: string) => {
    window.open(`https://codeforces.com/profile/${handle}`, '_blank');
  };

  const getFilteredContests = () => {
    const days = parseInt(contestFilter);
    const cutoffDate = subDays(new Date(), days);
    return contests.filter(contest => 
      isAfter(new Date(contest.ratingUpdateTimeSeconds * 1000), cutoffDate)
    );
  };

  const getFilteredSubmissions = () => {
    const days = parseInt(problemFilter);
    const cutoffDate = subDays(new Date(), days);
    return submissions.filter(submission => 
      isAfter(new Date(submission.creationTimeSeconds * 1000), cutoffDate)
    );
  };

  const getAcceptedSubmissions = () => {
    return getFilteredSubmissions().filter(sub => sub.verdict === 'OK');
  };

  const getProblemStats = () => {
    const accepted = getAcceptedSubmissions();
    const uniqueProblems = new Map();
    
    accepted.forEach(sub => {
      const key = `${sub.problem.contestId}-${sub.problem.index}`;
      if (!uniqueProblems.has(key) || 
          sub.creationTimeSeconds > uniqueProblems.get(key).creationTimeSeconds) {
        uniqueProblems.set(key, sub);
      }
    });

    const problems = Array.from(uniqueProblems.values());
    const totalProblems = problems.length;
    const avgRating = problems.reduce((sum, p) => sum + (p.problem.rating || 0), 0) / totalProblems || 0;
    const maxRating = Math.max(...problems.map(p => p.problem.rating || 0));
    const avgPerDay = totalProblems / parseInt(problemFilter);

    return { totalProblems, avgRating, maxRating, avgPerDay, problems };
  };

  const getRatingDistribution = () => {
    const { problems } = getProblemStats();
    const buckets = {
      '800-1199': 0,
      '1200-1599': 0,
      '1600-1999': 0,
      '2000-2399': 0,
      '2400+': 0
    };

    problems.forEach(p => {
      const rating = p.problem.rating || 0;
      if (rating < 1200) buckets['800-1199']++;
      else if (rating < 1600) buckets['1200-1599']++;
      else if (rating < 2000) buckets['1600-1999']++;
      else if (rating < 2400) buckets['2000-2399']++;
      else buckets['2400+']++;
    });

    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count
    }));
  };

  const getSubmissionHeatmap = () => {
    const submissions = getFilteredSubmissions();
    const heatmapData: Record<string, number> = {};
    
    submissions.forEach(sub => {
      const date = format(new Date(sub.creationTimeSeconds * 1000), 'yyyy-MM-dd');
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });

    return heatmapData;
  };

  const filteredContests = getFilteredContests();
  const stats = getProblemStats();
  const ratingDistribution = getRatingDistribution();
  const heatmapData = getSubmissionHeatmap();

  const chartData = filteredContests.map(contest => ({
    date: format(new Date(contest.ratingUpdateTimeSeconds * 1000), 'MMM dd'),
    rating: contest.newRating,
    change: contest.newRating - contest.oldRating
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{student.name}</h2>
          <button 
            onClick={() => openCodeforcesProfile(student.codeforcesHandle)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors flex items-center gap-1 group"
          >
            @{student.codeforcesHandle}
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">Current Rating</span>
            </div>
            <div className="mt-2">
              <Badge 
                variant="outline"
                className={`rating-color ${getCodeforcesRatingTitle(student.currentRating)} border-slate-300 dark:border-slate-600`}
              >
                {formatRating(student.currentRating)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Max Rating</span>
            </div>
            <div className="mt-2">
              <Badge 
                variant="outline"
                className={`rating-color ${getCodeforcesRatingTitle(student.maxRating)} border-slate-300 dark:border-slate-600`}
              >
                {formatRating(student.maxRating)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Problems Solved</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{stats.totalProblems}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-violet-500" />
              <span className="text-sm text-muted-foreground">Avg/Day</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold">{stats.avgPerDay.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contests" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="contests">Contest History</TabsTrigger>
          <TabsTrigger value="problems">Problem Solving</TabsTrigger>
        </TabsList>

        <TabsContent value="contests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Contest History</CardTitle>
                <Select value={contestFilter} onValueChange={setContestFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last 365 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="space-y-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="rating" stroke="#2563eb" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Recent Contests</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredContests.map((contest) => (
                        <div key={contest.contestId} className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800">
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-100">{contest.contestName}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              Rank: {contest.rank} | Problems: {contest.problemsSolved}/{contest.totalProblems}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant="outline"
                              className={`border-slate-300 dark:border-slate-600 ${
                                contest.newRating >= contest.oldRating 
                                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20' 
                                  : 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20'
                              }`}
                            >
                              {contest.newRating >= contest.oldRating ? '+' : ''}{contest.newRating - contest.oldRating}
                            </Badge>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{contest.newRating}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No contests found in the selected time period.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="problems" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Problem Solving Statistics</CardTitle>
                <Select value={problemFilter} onValueChange={setProblemFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.totalProblems}</p>
                    <p className="text-sm text-muted-foreground">Total Solved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{Math.round(stats.avgRating)}</p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-violet-600">{stats.maxRating}</p>
                    <p className="text-sm text-muted-foreground">Hardest Problem</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">{stats.avgPerDay.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">Per Day</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Problems by Rating</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ratingDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Submission Heatmap</h4>
                  <div className="grid grid-cols-7 gap-1 text-xs">
                    {Object.entries(heatmapData).slice(0, 49).map(([date, count]) => (
                      <div
                        key={date}
                        className={`aspect-square rounded-sm border flex items-center justify-center ${
                          (count as number) > 5 ? 'bg-emerald-600 text-white' :
                          (count as number) > 3 ? 'bg-emerald-400' :
                          (count as number) > 1 ? 'bg-emerald-200' :
                          (count as number) > 0 ? 'bg-emerald-100' : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                        title={`${date}: ${count} submissions`}
                      >
                        {(count as number) > 0 && count}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentProfile;
