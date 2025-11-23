"use client"

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  GitPullRequest, 
  Clock,
  Bug,
  FileCode,
  ChevronDown,
  ChevronUp,
  Github,
  ExternalLink
} from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// --- Mock Data ---

const areaChartData = [
  { month: "Jan", critical: 12, warning: 45, info: 80 },
  { month: "Feb", critical: 8, warning: 35, info: 95 },
  { month: "Mar", critical: 15, warning: 50, info: 110 },
  { month: "Apr", critical: 5, warning: 25, info: 90 },
  { month: "May", critical: 10, warning: 40, info: 130 },
  { month: "Jun", critical: 3, warning: 20, info: 150 },
]

const areaChartConfig = {
  critical: {
    label: "Critical",
    color: "#ef4444", // Red-500
  },
  warning: {
    label: "Warning",
    color: "#FCD34D", // Yellow-400 (Project Color)
  },
  info: {
    label: "Info",
    color: "#3b82f6", // Blue-500
  },
} satisfies ChartConfig

const barChartData = [
  { day: "Mon", merged: 12, opened: 15 },
  { day: "Tue", merged: 18, opened: 22 },
  { day: "Wed", merged: 25, opened: 20 },
  { day: "Thu", merged: 15, opened: 25 },
  { day: "Fri", merged: 30, opened: 18 },
  { day: "Sat", merged: 5, opened: 8 },
  { day: "Sun", merged: 2, opened: 5 },
]

const barChartConfig = {
  merged: {
    label: "Merged",
    color: "#4ADE80", // Green-400 (Project Color)
  },
  opened: {
    label: "Opened",
    color: "#000000", // Black
  },
} satisfies ChartConfig

const recentIssues = [
  {
    id: "ISS-1024",
    severity: "critical",
    message: "Potential SQL Injection vulnerability detected in user input handling.",
    file: "backend/app/api/users.py",
    time: "2 hours ago",
    status: "Open"
  },
  {
    id: "ISS-1023",
    severity: "warning",
    message: "Unused variable 'config' declared.",
    file: "frontend/src/components/Sidebar.tsx",
    time: "4 hours ago",
    status: "Fixed"
  },
  {
    id: "ISS-1022",
    severity: "info",
    message: "Function complexity exceeds recommended limit (Cyclomatic Complexity > 10).",
    file: "backend/app/services/analytics.py",
    time: "1 day ago",
    status: "Open"
  },
  {
    id: "ISS-1021",
    severity: "critical",
    message: "Hardcoded secret key found in configuration file.",
    file: "backend/core/config.py",
    time: "1 day ago",
    status: "Fixed"
  },
  {
    id: "ISS-1020",
    severity: "warning",
    message: "Missing dependency in useEffect dependency array.",
    file: "frontend/src/pages/Dashboard.tsx",
    time: "2 days ago",
    status: "Open"
  },
]

export const AnalyticsPage: React.FC = () => {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const toggleIssue = (id: string) => {
    setExpandedIssue(expandedIssue === id ? null : id);
  };

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-black">Analytics</h1>
        <p className="text-muted-foreground">Overview of your code quality and team velocity.</p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">Total PRs</CardTitle>
            <GitPullRequest className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-black">1,284</div>
            <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">Avg. Merge Time</CardTitle>
            <Clock className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-black">4h 12m</div>
            <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-green-600">-18%</span> faster than avg
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">Issues Found</CardTitle>
            <Bug className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-black">24</div>
            <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-red-600" />
              <span className="text-red-600">+4</span> new critical
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">Code Quality</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-black" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-black">A+</div>
            <p className="text-xs font-bold text-muted-foreground">
              Top 5% of repositories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart 1: AI Issues Trend */}
        <Card className="flex flex-col border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle>AI Issues Detected</CardTitle>
            <CardDescription>Breakdown by severity over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={areaChartConfig} className="mx-auto w-full h-[300px]">
              <AreaChart
                data={areaChartData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12
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
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
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

        {/* Chart 2: PR Velocity */}
        <Card className="flex flex-col border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader>
            <CardTitle>PR Velocity</CardTitle>
            <CardDescription>Weekly pull request activity</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            <ChartContainer config={barChartConfig} className="mx-auto w-full h-[300px]">
              <BarChart accessibilityLayer data={barChartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <ChartLegend content={<ChartLegendContent payload={[]} />} />
                <Bar dataKey="opened" fill="var(--color-opened)" radius={4} />
                <Bar dataKey="merged" fill="var(--color-merged)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues List */}
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <CardTitle>Recent AI Detected Issues</CardTitle>
          <CardDescription>Latest code quality and security findings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-black hover:bg-transparent bg-white">
                <TableHead className="text-black font-bold">Severity</TableHead>
                <TableHead className="text-black font-bold">Issue</TableHead>
                <TableHead className="text-black font-bold">File</TableHead>
                <TableHead className="text-black font-bold">Time</TableHead>
                <TableHead className="text-black font-bold text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentIssues.map((issue) => (
                <React.Fragment key={issue.id}>
                  <TableRow 
                    className="border-b border-gray-200 bg-white hover:bg-[#FCD34D] cursor-pointer transition-colors"
                    onClick={() => toggleIssue(issue.id)}
                  >
                    <TableCell>
                      <Badge 
                        variant="neutral" 
                        className={`
                          border-2 font-bold
                          ${issue.severity === 'critical' ? 'border-red-500 bg-red-100 text-red-700' : ''}
                          ${issue.severity === 'warning' ? 'border-yellow-500 bg-yellow-100 text-yellow-700' : ''}
                          ${issue.severity === 'info' ? 'border-blue-500 bg-blue-100 text-blue-700' : ''}
                        `}
                      >
                        {issue.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{issue.message}</TableCell>
                    <TableCell className="text-muted-foreground flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      {issue.file}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{issue.time}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Badge variant="neutral" className="border-2 border-black bg-white text-black">
                          {issue.status}
                        </Badge>
                        {expandedIssue === issue.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedIssue === issue.id && (
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableCell colSpan={5} className="p-4">
                        <div className="rounded-md border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <div className="mb-4 flex items-center justify-between">
                            <h4 className="font-bold text-lg">Issue Details</h4>
                            <div className="flex gap-2">
                              <Button size="sm" variant="neutral" className="border-2 border-black gap-2">
                                <Github className="h-4 w-4" />
                                View on GitHub
                              </Button>
                              <Button size="sm" variant="neutral" className="border-2 border-black gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Open File
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <h5 className="font-bold text-sm mb-2">Description</h5>
                              <p className="text-sm text-muted-foreground">
                                This issue was detected by the AI review engine. It indicates a potential security vulnerability or code quality issue that should be addressed before merging.
                              </p>
                            </div>
                            
                            <div>
                              <h5 className="font-bold text-sm mb-2">Suggested Fix</h5>
                              <div className="rounded-md bg-gray-900 p-4 text-sm font-mono text-white overflow-x-auto">
                                <div className="flex flex-col gap-1">
                                  <div className="text-red-400">- const query = "SELECT * FROM users WHERE id = " + userId;</div>
                                  <div className="text-green-400">+ const query = "SELECT * FROM users WHERE id = ?";</div>
                                  <div className="text-green-400">+ db.execute(query, [userId]);</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
