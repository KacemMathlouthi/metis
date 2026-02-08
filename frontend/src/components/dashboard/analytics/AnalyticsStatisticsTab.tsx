import React, { useMemo } from 'react';
import { Bug, Clock3, GitPullRequest, Timer } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { AnalyticsCardMetric, AnalyticsOverviewResponse } from '@/types/api';

interface AnalyticsStatisticsTabProps {
  selectedRepository: string | null;
  overview: AnalyticsOverviewResponse | null;
  loading: boolean;
  error: string | null;
}

const severityChartConfig = {
  CRITICAL: { label: 'Critical', color: 'var(--metis-red)' },
  ERROR: { label: 'Error', color: '#ef4444' },
  WARNING: { label: 'Warning', color: 'var(--metis-orange-light)' },
  INFO: { label: 'Info', color: 'var(--metis-orange)' },
} satisfies ChartConfig;

const categoryChartConfig = {
  BUG: { label: 'Bug', color: '#ef4444' },
  SECURITY: { label: 'Security', color: '#dc2626' },
  PERFORMANCE: { label: 'Performance', color: '#f97316' },
  STYLE: { label: 'Style', color: '#f59e0b' },
  MAINTAINABILITY: { label: 'Maintainability', color: '#facc15' },
  DOCUMENTATION: { label: 'Documentation', color: '#84cc16' },
  TESTING: { label: 'Testing', color: '#22c55e' },
} satisfies ChartConfig;

const cardOrder = [
  'total_findings',
  'completed_reviews',
  'affected_pull_requests',
  'avg_review_latency_seconds',
] as const;

function cardIcon(key: string) {
  if (key === 'total_findings') return Bug;
  if (key === 'completed_reviews') return GitPullRequest;
  if (key === 'affected_pull_requests') return GitPullRequest;
  if (key === 'avg_review_latency_seconds') return Clock3;
  return Timer;
}

export const AnalyticsStatisticsTab: React.FC<AnalyticsStatisticsTabProps> = ({
  selectedRepository,
  overview,
  loading,
  error,
}) => {
  const cards = useMemo(() => {
    const byKey = new Map<string, AnalyticsCardMetric>();
    for (const card of overview?.cards ?? []) {
      byKey.set(card.key, card);
    }
    return cardOrder
      .map((key) => byKey.get(key))
      .filter((card): card is AnalyticsCardMetric => Boolean(card));
  }, [overview?.cards]);

  if (!selectedRepository) {
    return (
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="py-10 text-center text-black/60 font-medium">
          Select a repository to view analytics.
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="py-10 text-center text-black/60 font-medium">
          Loading analytics...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardContent className="py-10 text-center text-[var(--metis-red)] font-medium">
          Failed to load analytics: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = cardIcon(card.key);
          return (
            <Card
              key={card.key}
              className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-black/60 text-sm font-bold">{card.label}</CardTitle>
                <Icon className="h-4 w-4 text-black" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-black">{card.display_value}</div>
                <p className="text-[11px] leading-tight text-black/55">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="font-black">AI Issues by Severity</CardTitle>
            <CardDescription className="font-medium text-black/60">
              Daily findings over the last {overview?.window_days ?? 7} days
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={severityChartConfig} className="mx-auto h-[300px] w-full">
              <AreaChart
                data={overview?.severity_chart ?? []}
                margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis allowDecimals={false} domain={[0, 'auto']} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Area dataKey="INFO" type="monotone" fill="var(--color-INFO)" fillOpacity={0.3} stroke="var(--color-INFO)" stackId="a" />
                <Area dataKey="WARNING" type="monotone" fill="var(--color-WARNING)" fillOpacity={0.3} stroke="var(--color-WARNING)" stackId="a" />
                <Area dataKey="ERROR" type="monotone" fill="var(--color-ERROR)" fillOpacity={0.3} stroke="var(--color-ERROR)" stackId="a" />
                <Area dataKey="CRITICAL" type="monotone" fill="var(--color-CRITICAL)" fillOpacity={0.3} stroke="var(--color-CRITICAL)" stackId="a" />
                <ChartLegend content={<ChartLegendContent payload={[]} className="flex-wrap gap-x-3 gap-y-1" />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle className="font-black">AI Issues by Category</CardTitle>
            <CardDescription className="font-medium">
              Daily category distribution over the last {overview?.window_days ?? 7} days
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={categoryChartConfig} className="mx-auto h-[300px] w-full">
              <BarChart accessibilityLayer data={overview?.category_chart ?? []}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                />
                <YAxis allowDecimals={false} domain={[0, 'auto']} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <ChartLegend content={<ChartLegendContent payload={[]} className="flex-wrap gap-x-3 gap-y-1" />} />
                <Bar dataKey="BUG" stackId="a" fill="var(--color-BUG)" radius={2} />
                <Bar dataKey="SECURITY" stackId="a" fill="var(--color-SECURITY)" radius={2} />
                <Bar dataKey="PERFORMANCE" stackId="a" fill="var(--color-PERFORMANCE)" radius={2} />
                <Bar dataKey="STYLE" stackId="a" fill="var(--color-STYLE)" radius={2} />
                <Bar dataKey="MAINTAINABILITY" stackId="a" fill="var(--color-MAINTAINABILITY)" radius={2} />
                <Bar dataKey="DOCUMENTATION" stackId="a" fill="var(--color-DOCUMENTATION)" radius={2} />
                <Bar dataKey="TESTING" stackId="a" fill="var(--color-TESTING)" radius={2} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
