import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  Github,
  GitPullRequest,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useRepository } from '@/contexts/RepositoryContext';

const miniChartData = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 18 },
  { name: 'Wed', value: 15 },
  { name: 'Thu', value: 25 },
  { name: 'Fri', value: 20 },
  { name: 'Sat', value: 32 },
  { name: 'Sun', value: 28 },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedRepo } = useRepository();

  return (
    <div className="space-y-8 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Dashboard</h1>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-muted-foreground text-lg">Repository:</p>
            <Badge
              variant="neutral"
              className="border-2 border-black bg-[#FCD34D] px-3 py-1 text-lg font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              {selectedRepo?.repository || 'No repository selected'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-bold">PRs Reviewed</p>
              <GitPullRequest className="h-4 w-4 text-gray-500" />
            </div>
            <p className="mt-1 text-2xl font-black">128</p>
            <p className="mt-1 text-[10px] font-bold text-green-600">+12% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-bold">Issues Detected</p>
              <AlertCircle className="h-4 w-4 text-gray-500" />
            </div>
            <p className="mt-1 text-2xl font-black">14</p>
            <p className="mt-1 text-xs font-bold text-red-600">3 critical requiring attention</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-bold">Time Saved</p>
              <CheckCircle2 className="h-4 w-4 text-gray-500" />
            </div>
            <p className="mt-1 text-2xl font-black">42h</p>
            <p className="mt-1 text-xs font-bold text-blue-600">Estimated manual review time</p>
          </CardContent>
        </Card>
      </div>

      {/* Explore Section */}
      <div className="flex-1">
        <h2 className="mb-6 text-2xl font-black">Quick Actions</h2>
        <div className="grid h-full gap-6 md:grid-cols-3">
          {/* Analytics Card */}
          <Card
            className="group flex cursor-pointer flex-col border-2 border-black bg-white transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#FCD34D]"
            onClick={() => navigate('/dashboard/analytics')}
          >
            <CardContent className="flex flex-1 flex-col p-6">
              <div className="relative mb-4 min-h-[200px] flex-1 overflow-hidden rounded border-2 border-black bg-white p-2">
                <div className="absolute inset-0 pt-4 pr-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={miniChartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FCD34D" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#FCD34D" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" hide />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#000"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <h3 className="mb-2 flex items-center gap-2 text-lg font-black">
                Analytics
                <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>
              <p className="text-muted-foreground text-sm">
                Deep dive into your team's velocity and code quality metrics.
              </p>
            </CardContent>
          </Card>

          {/* AI Review Settings Card */}
          <Card
            className="group flex cursor-pointer flex-col border-2 border-black bg-white transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#F472B6]"
            onClick={() => navigate('/dashboard/ai-review')}
          >
            <CardContent className="flex flex-1 flex-col p-6">
              <div className="relative mb-4 flex min-h-[200px] flex-1 flex-col overflow-hidden rounded border-2 border-black bg-[#1e1e1e] p-0">
                <div className="flex items-center justify-between border-b border-[#404040] bg-[#2d2d2d] px-3 py-2">
                  <span className="font-mono text-[10px] text-gray-400">src/utils/calc.ts</span>
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="p-4 font-mono text-[11px] leading-relaxed text-gray-300">
                  <div className="flex">
                    <span className="w-6 text-gray-600 select-none">1</span>
                    <span>
                      <span className="mr-1.5 text-purple-400">function</span>
                      <span className="text-blue-400">calculate</span>
                      <span className="text-[#FCD34D]">(items)</span> {'{'}
                    </span>
                  </div>
                  <div className="flex w-full bg-red-900/30">
                    <span className="w-6 text-gray-600 select-none">2</span>
                    <span className="text-red-400">- var total = 0;</span>
                  </div>
                  <div className="flex w-full bg-green-900/30">
                    <span className="w-6 text-gray-600 select-none">2</span>
                    <span className="text-green-400">+ let total = 0;</span>
                  </div>
                  <div className="flex">
                    <span className="w-6 text-gray-600 select-none">3</span>
                    <span className="text-gray-300"> items.forEach(i ={'>'} total += i);</span>
                  </div>
                  <div className="flex">
                    <span className="w-6 text-gray-600 select-none">4</span>
                    <span className="text-gray-300">{'}'}</span>
                  </div>
                </div>

                <div className="absolute right-3 bottom-3">
                  <Badge
                    variant="neutral"
                    className="border-2 border-black bg-[#F472B6] font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    AI Fix Applied
                  </Badge>
                </div>
              </div>
              <h3 className="mb-2 flex items-center gap-2 text-lg font-black">
                AI Review Settings
                <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>
              <p className="text-muted-foreground text-sm">
                Configure sensitivity, ignore patterns, and custom instructions.
              </p>
            </CardContent>
          </Card>

          {/* Contribute Card */}
          <Card
            className="group flex cursor-pointer flex-col border-2 border-black bg-white transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#4ADE80]"
            onClick={() => window.open('https://github.com/KacemMathlouthi/metis', '_blank')}
          >
            <CardContent className="flex flex-1 flex-col p-6">
              <div className="relative mb-4 flex min-h-[200px] flex-1 flex-col items-center justify-center gap-3 overflow-hidden rounded border-2 border-black bg-gray-50">
                <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] opacity-10"></div>
                <Github className="z-10 h-16 w-16" />
                <div className="z-10 flex items-center gap-1 rounded border-2 border-black bg-white px-3 py-1.5 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[1px] hover:shadow-none">
                  <ExternalLink className="h-3 w-3" />
                  KacemMathlouthi/metis
                </div>
              </div>
              <h3 className="mb-2 flex items-center gap-2 text-lg font-black">
                Contribute to Metis
                <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>
              <p className="text-muted-foreground text-sm">
                Check out the source code, report issues, or contribute to the project.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
