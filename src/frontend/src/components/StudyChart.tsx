import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StudyChartProps {
  statistics?: {
    dailyStudyTime: Array<[bigint, bigint]>;
    weeklyTrends: Array<[bigint, bigint]>;
    sessionDistribution: Array<[bigint, bigint]>;
  };
}

export function StudyChart({ statistics }: StudyChartProps) {
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="time">Study Time</TabsTrigger>
          <TabsTrigger value="distribution">Session Distribution</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
