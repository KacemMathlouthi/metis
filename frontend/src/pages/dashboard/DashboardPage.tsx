import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Github, GitPullRequest, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, XAxis, CartesianGrid } from "recharts"
import { Badge } from "@/components/ui/badge"

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

  return (
    <div className="space-y-8 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black">Dashboard</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-muted-foreground text-lg">Repository:</p>
            <Badge variant="neutral" className="text-lg px-3 py-1 border-2 border-black bg-[#FCD34D] font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              metis-backend
            </Badge>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground">PRs Reviewed</p>
              <GitPullRequest className="h-4 w-4 text-gray-500" />
            </div>
            <p className="mt-1 text-2xl font-black">128</p>
            <p className="text-[10px] text-green-600 font-bold mt-1">+12% from last month</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground">Issues Detected</p>
              <AlertCircle className="h-4 w-4 text-gray-500" />
            </div>
            <p className="mt-1 text-2xl font-black">14</p>
            <p className="text-xs text-red-600 font-bold mt-1">3 critical requiring attention</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground">Time Saved</p>
              <CheckCircle2 className="h-4 w-4 text-gray-500" />
            </div>
            <p className="mt-1 text-2xl font-black">42h</p>
            <p className="text-xs text-blue-600 font-bold mt-1">Estimated manual review time</p>
          </CardContent>
        </Card>
      </div>

      {/* Explore Section */}
      <div className="flex-1">
        <h2 className="mb-6 text-2xl font-black">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-3 h-full">
          
          {/* Analytics Card */}
          <Card 
            className="group cursor-pointer border-2 border-black bg-white transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#FCD34D] flex flex-col"
            onClick={() => navigate('/dashboard/analytics')}
          >
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="mb-4 flex-1 min-h-[200px] rounded border-2 border-black bg-white p-2 overflow-hidden relative">
                 <div className="absolute inset-0 pt-4 pr-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={miniChartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FCD34D" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#FCD34D" stopOpacity={0}/>
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
              <h3 className="mb-2 text-lg font-black flex items-center gap-2">
                Analytics
                <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>
              <p className="text-sm text-muted-foreground">Deep dive into your team's velocity and code quality metrics.</p>
            </CardContent>
          </Card>

          {/* AI Review Settings Card */}
          <Card 
            className="group cursor-pointer border-2 border-black bg-white transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#F472B6] flex flex-col"
            onClick={() => navigate('/dashboard/ai-review')}
          >
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="mb-4 flex-1 min-h-[200px] rounded border-2 border-black bg-[#1e1e1e] p-0 overflow-hidden relative flex flex-col">
                <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-[#404040]">
                  <span className="text-[10px] text-gray-400 font-mono">src/utils/calc.ts</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="p-4 font-mono text-[11px] leading-relaxed text-gray-300">
                  <div className="flex">
                    <span className="text-gray-600 w-6 select-none">1</span>
                    <span><span className="text-purple-400 mr-1.5">function</span><span className="text-blue-400">calculate</span><span className="text-[#FCD34D]">(items)</span> {'{'}</span>
                  </div>
                  <div className="flex bg-red-900/30 w-full">
                    <span className="text-gray-600 w-6 select-none">2</span>
                    <span className="text-red-400">-  var total = 0;</span>
                  </div>
                  <div className="flex bg-green-900/30 w-full">
                    <span className="text-gray-600 w-6 select-none">2</span>
                    <span className="text-green-400">+  let total = 0;</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-6 select-none">3</span>
                    <span className="text-gray-300">   items.forEach(i ={'>'} total += i);</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-600 w-6 select-none">4</span>
                    <span className="text-gray-300">{'}'}</span>
                  </div>
                </div>
                
                <div className="absolute bottom-3 right-3">
                  <Badge variant="neutral" className="bg-[#F472B6] text-black border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    AI Fix Applied
                  </Badge>
                </div>
              </div>
              <h3 className="mb-2 text-lg font-black flex items-center gap-2">
                AI Review Settings
                <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>
              <p className="text-sm text-muted-foreground">Configure sensitivity, ignore patterns, and custom instructions.</p>
            </CardContent>
          </Card>

          {/* Contribute Card */}
          <Card 
            className="group cursor-pointer border-2 border-black bg-white transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#4ADE80] flex flex-col"
            onClick={() => window.open('https://github.com/KacemMathlouthi/metis', '_blank')}
          >
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="mb-4 flex-1 min-h-[200px] rounded border-2 border-black bg-gray-50 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]"></div>
                <Github className="h-16 w-16 z-10" />
                <div className="flex items-center gap-1 text-sm font-bold z-10 bg-white px-3 py-1.5 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all">
                  <ExternalLink className="h-3 w-3" />
                  KacemMathlouthi/metis
                </div>
              </div>
              <h3 className="mb-2 text-lg font-black flex items-center gap-2">
                Contribute to Metis
                <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </h3>
              <p className="text-sm text-muted-foreground">Check out the source code, report issues, or contribute to the project.</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};
