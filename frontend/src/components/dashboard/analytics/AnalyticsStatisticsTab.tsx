import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  GitPullRequest,
  Clock,
  Bug,
} from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

const areaChartData = [
  { month: 'Jan', critical: 12, warning: 45, info: 80 },
  { month: 'Feb', critical: 8, warning: 35, info: 95 },
  { month: 'Mar', critical: 15, warning: 50, info: 110 },
  { month: 'Apr', critical: 5, warning: 25, info: 90 },
  { month: 'May', critical: 10, warning: 40, info: 130 },
  { month: 'Jun', critical: 3, warning: 20, info: 150 },
];

const areaChartConfig = {
  critical: {
    label: 'Critical',
    color: 'var(--metis-red)',
  },
  warning: {
    label: 'Warning',
    color: 'var(--metis-orange-light)',
  },
  info: {
    label: 'Info',
    color: 'var(--metis-orange)',
  },
} satisfies ChartConfig;

const barChartData = [
  { day: 'Mon', merged: 12, opened: 15 },
  { day: 'Tue', merged: 18, opened: 22 },
  { day: 'Wed', merged: 25, opened: 20 },
  { day: 'Thu', merged: 15, opened: 25 },
  { day: 'Fri', merged: 30, opened: 18 },
  { day: 'Sat', merged: 5, opened: 8 },
  { day: 'Sun', merged: 2, opened: 5 },
];

const barChartConfig = {
  merged: {
    label: 'Merged',
    color: 'var(--metis-orange-dark)',
  },
  opened: {
    label: 'Opened',
    color: 'var(--metis-black)',
  },
} satisfies ChartConfig;

export const AnalyticsStatisticsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-black/60 text-sm font-bold">Total PRs</CardTitle>
            <GitPullRequest className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-black">1,284</div>
            <p className="text-black/60 flex items-center gap-1 text-xs font-bold">
              <TrendingUp className="h-3 w-3 text-[var(--metis-orange-dark)]" />
              <span className="text-[var(--metis-orange-dark)]">+12%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-black/60 text-sm font-bold">Avg. Merge Time</CardTitle>
            <Clock className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-black">4h 12m</div>
            <p className="text-black/60 flex items-center gap-1 text-xs font-bold">
              <TrendingDown className="h-3 w-3 text-[var(--metis-orange-dark)]" />
              <span className="text-[var(--metis-orange-dark)]">-18%</span> faster than avg
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-black/60 text-sm font-bold">Issues Found</CardTitle>
            <Bug className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-black">24</div>
            <p className="text-black/60 flex items-center gap-1 text-xs font-bold">
              <AlertCircle className="h-3 w-3 text-[var(--metis-red)]" />
              <span className="text-[var(--metis-red)]">+4</span> new critical
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-black/60 text-sm font-bold">Code Quality</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-black">A+</div>
            <p className="text-black/60 text-xs font-bold">Top 5% of repositories</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="font-black">AI Issues Detected</CardTitle>
            <CardDescription className="font-medium text-black/60">
              Breakdown by severity over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={areaChartConfig} className="mx-auto h-[300px] w-full">
              <AreaChart
                data={areaChartData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Area
                  dataKey="info"
                  type="natural"
                  fill="var(--color-info)"
                  fillOpacity={0.4}
                  stroke="var(--color-info)"
                  stackId="a"
                />
                <Area
                  dataKey="warning"
                  type="natural"
                  fill="var(--color-warning)"
                  fillOpacity={0.4}
                  stroke="var(--color-warning)"
                  stackId="a"
                />
                <Area
                  dataKey="critical"
                  type="natural"
                  fill="var(--color-critical)"
                  fillOpacity={0.4}
                  stroke="var(--color-critical)"
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent payload={[]} />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="font-black">PR Velocity</CardTitle>
            <CardDescription className="font-medium">Weekly pull request activity</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={barChartConfig} className="mx-auto h-[300px] w-full">
              <BarChart accessibilityLayer data={barChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                <ChartLegend content={<ChartLegendContent payload={[]} />} />
                <Bar dataKey="opened" fill="var(--color-opened)" radius={4} />
                <Bar dataKey="merged" fill="var(--color-merged)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
