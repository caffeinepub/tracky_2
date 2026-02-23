import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { StudySession, SyllabusChapter } from '../backend';

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
  const chapterTimeData: { name: string; value: number }[] = [];
  const chapterSessionData: { name: string; value: number }[] = [];
  
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
        });
        chapterSessionData.push({
          name: chapter.title,
          value: stats.count,
        });
      }
    });
  }

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="time">Study Time</TabsTrigger>
          <TabsTrigger value="distribution">Session Distribution</TabsTrigger>
          <TabsTrigger value="chapters">By Chapter</TabsTrigger>
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
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chapterTimeData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
                      {chapterSessionData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
      </Tabs>
    </div>
  );
}
