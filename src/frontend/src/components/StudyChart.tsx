import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import type { StudySession, SyllabusChapter } from '../lib/types';

interface StudyChartProps {
  statistics?: {
    dailyStudyTime: Array<[bigint, bigint]>;
    weeklyTrends: Array<[bigint, bigint]>;
    sessionDistribution: Array<[bigint, bigint]>;
  };
  sessions?: StudySession[];
  chapters?: SyllabusChapter[];
}

const CHART_COLORS = [
  'oklch(var(--chart-1))',
  'oklch(var(--chart-2))',
  'oklch(var(--chart-3))',
  'oklch(var(--chart-4))',
  'oklch(var(--chart-5))',
];

export function StudyChart({ statistics, sessions, chapters }: StudyChartProps) {
  const [period, setPeriod] = useState<'daily' | 'weekly'>('daily');

  // Transform data for charts
  const dailyData = statistics?.dailyStudyTime.map(([day, minutes]) => ({
    name: `Day ${Number(day)}`,
    minutes: Number(minutes),
  })) || [];

  const weeklyData = statistics?.weeklyTrends.map(([week, minutes]) => ({
    name: `Week ${Number(week)}`,
    minutes: Number(minutes),
  })) || [];

  const distributionData = statistics?.sessionDistribution.map(([hour, count]) => ({
    name: `${Number(hour)}:00`,
    sessions: Number(count),
  })) || [];

  // Calculate chapter distribution
  const chapterTimeData: { name: string; value: number; completed: boolean }[] = [];
  const chapterSessionData: { name: string; value: number; completed: boolean }[] = [];
  
  if (sessions && chapters && chapters.length > 0) {
    const chapterStats = new Map<string, { time: number; count: number }>();
    
    sessions.filter((s) => s.completed && s.chapterId).forEach((session) => {
      const chapterId = session.chapterId!;
      const duration = Number(session.endTime) - Number(session.startTime);
      const minutes = duration / (1000 * 1000 * 1000 * 60);
      
      const existing = chapterStats.get(chapterId) || { time: 0, count: 0 };
      chapterStats.set(chapterId, {
        time: existing.time + minutes,
        count: existing.count + 1,
      });
    });

    chapterStats.forEach((stats, chapterId) => {
      const chapter = chapters.find((c) => c.id === chapterId);
      if (chapter) {
        chapterTimeData.push({
          name: chapter.title,
          value: Math.floor(stats.time),
          completed: chapter.completed,
        });
        chapterSessionData.push({
          name: chapter.title,
          value: stats.count,
          completed: chapter.completed,
        });
      }
    });
  }

  // Calculate chapter completion statistics
  const totalChapters = chapters?.length || 0;
  const completedChapters = chapters?.filter(c => c.completed).length || 0;
  const incompleteChapters = totalChapters - completedChapters;
  const completionPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const completionData = [
    { name: 'Completed', value: completedChapters, color: 'oklch(var(--primary))' },
    { name: 'Incomplete', value: incompleteChapters, color: 'oklch(var(--muted))' },
  ].filter(d => d.value > 0);

  if (!statistics || (dailyData.length === 0 && weeklyData.length === 0 && distributionData.length === 0)) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-muted-foreground">No data available yet</p>
        <p className="text-sm text-muted-foreground">
          Complete more study sessions to see your statistics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="time" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="time">Study Time</TabsTrigger>
          <TabsTrigger value="distribution">Session Distribution</TabsTrigger>
          <TabsTrigger value="chapters">By Chapter</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
        </TabsList>
        
        <TabsContent value="time" className="space-y-4">
          <div className="flex justify-end">
            <Select value={period} onValueChange={(value) => setPeriod(value as 'daily' | 'weekly')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={period === 'daily' ? dailyData : weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="oklch(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="oklch(var(--muted-foreground))"
                fontSize={12}
                label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'oklch(var(--card))',
                  border: '1px solid oklch(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="minutes" 
                stroke="oklch(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'oklch(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>
        
        <TabsContent value="distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="oklch(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="oklch(var(--muted-foreground))"
                fontSize={12}
                label={{ value: 'Sessions', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'oklch(var(--card))',
                  border: '1px solid oklch(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar 
                dataKey="sessions" 
                fill="oklch(var(--primary))" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="chapters" className="space-y-4">
          {chapterTimeData.length > 0 ? (
            <>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Study Time by Chapter</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chapterTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="oklch(var(--muted-foreground))"
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      stroke="oklch(var(--muted-foreground))"
                      fontSize={12}
                      label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'oklch(var(--card))',
                        border: '1px solid oklch(var(--border))',
                        borderRadius: '8px',
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm text-muted-foreground">{data.value} minutes</p>
                              {data.completed && (
                                <div className="flex items-center gap-1 mt-1">
                                  <CheckCircle2 className="h-3 w-3 text-primary" />
                                  <span className="text-xs text-primary">Completed</span>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chapterTimeData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.completed ? 'oklch(var(--primary))' : CHART_COLORS[index % CHART_COLORS.length]} 
                          opacity={entry.completed ? 0.7 : 1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Session Count by Chapter</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chapterSessionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="oklch(var(--primary))"
                      dataKey="value"
                    >
                      {chapterSessionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.completed ? 'oklch(var(--primary))' : CHART_COLORS[index % CHART_COLORS.length]}
                          opacity={entry.completed ? 0.7 : 1}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'oklch(var(--card))',
                        border: '1px solid oklch(var(--border))',
                        borderRadius: '8px',
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm text-muted-foreground">{data.value} sessions</p>
                              {data.completed && (
                                <div className="flex items-center gap-1 mt-1">
                                  <CheckCircle2 className="h-3 w-3 text-primary" />
                                  <span className="text-xs text-primary">Completed</span>
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="text-center py-12 space-y-2">
              <p className="text-muted-foreground">No chapter data available</p>
              <p className="text-sm text-muted-foreground">
                Complete study sessions with chapters assigned to see statistics
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completion" className="space-y-4">
          {totalChapters > 0 ? (
            <>
              <div className="p-6 border border-border/50 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Overall Progress</h3>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-foreground">{completionPercentage}%</p>
                    <p className="text-sm text-muted-foreground">Complete</p>
                  </div>
                </div>
                <Progress value={completionPercentage} className="h-3" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {completedChapters} of {totalChapters} chapters completed
                  </span>
                  <span className="text-muted-foreground">
                    {incompleteChapters} remaining
                  </span>
                </div>
              </div>

              {completionData.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Completion Breakdown</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={completionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {completionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'oklch(var(--card))',
                          border: '1px solid oklch(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-border/50 rounded-lg bg-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-foreground">Completed</h4>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{completedChapters}</p>
                  <p className="text-sm text-muted-foreground">chapters</p>
                </div>
                <div className="p-4 border border-border/50 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    <h4 className="font-semibold text-foreground">Incomplete</h4>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{incompleteChapters}</p>
                  <p className="text-sm text-muted-foreground">chapters</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 space-y-2">
              <p className="text-muted-foreground">No chapters yet</p>
              <p className="text-sm text-muted-foreground">
                Add chapters to track your completion progress
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
