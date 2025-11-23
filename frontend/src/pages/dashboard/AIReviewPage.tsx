import React, { useState } from 'react';
import { 
  Bot, 
  Zap, 
  FileText, 
  GitCommit, 
  Ban, 
  Book, 
  Plus, 
  Trash2,
  Sparkles
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export const AIReviewPage: React.FC = () => {
  const [sensitivity, setSensitivity] = useState<'low' | 'medium' | 'high'>('medium');
  const [ignorePatterns, setIgnorePatterns] = useState<string[]>(['*.test.ts', 'vendor/*']);
  const [newPattern, setNewPattern] = useState('');

  const addPattern = () => {
    if (newPattern && !ignorePatterns.includes(newPattern)) {
      setIgnorePatterns([...ignorePatterns, newPattern]);
      setNewPattern('');
    }
  };

  const removePattern = (pattern: string) => {
    setIgnorePatterns(ignorePatterns.filter(p => p !== pattern));
  };

  return (
    <div className="space-y-6 p-2 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black">Review Configuration</h1>
        <p className="text-muted-foreground">Customize Metis's code review behavior and preferences.</p>
      </div>

      {/* AI Agent Info */}
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <CardTitle>Metis Agent Capabilities</CardTitle>
          </div>
          <CardDescription>Automated feedback on pull requests with actionable insights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-md border-2 border-black bg-blue-50 p-4">
            <div className="mt-1 rounded-full bg-blue-200 p-1">
              <Sparkles className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <p className="font-bold text-sm">On-Demand Reviews</p>
              <p className="text-sm text-muted-foreground mt-1">
                Mention <Badge variant="neutral" className="bg-white border-black text-xs">@metis-ai</Badge> in any pull request to trigger a fresh review, ask for clarification, or request code changes.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 rounded-md border-2 border-black bg-green-50 p-4">
             <div className="mt-1 rounded-full bg-green-200 p-1">
              <Book className="h-4 w-4 text-green-700" />
            </div>
            <div>
              <p className="font-bold text-sm">Feedback Loop</p>
              <p className="text-sm text-muted-foreground mt-1">
                Reply directly to Metis's comments to provide context or correct its understanding of your project.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sensitivity */}
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6" />
            <CardTitle>Review Depth</CardTitle>
          </div>
          <CardDescription>Adjust the granularity and strictness of the analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'low', label: 'Low', desc: 'Focuses only on critical bugs and major security flaws.' },
              { id: 'medium', label: 'Default', desc: 'Standard analysis balancing comprehensive checks with noise reduction.' },
              { id: 'high', label: 'High', desc: 'Exhaustive review covering style, minor optimizations, and potential edge cases.' }
            ].map((option) => (
              <div 
                key={option.id}
                onClick={() => setSensitivity(option.id as any)}
                className={`
                  cursor-pointer rounded-md border-2 p-4 transition-all
                  ${sensitivity === option.id 
                    ? 'border-black bg-[#FCD34D] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                    : 'border-gray-200 hover:border-black hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">{option.label}</span>
                  {sensitivity === option.id && <div className="h-3 w-3 rounded-full bg-black" />}
                </div>
                <p className="text-xs text-muted-foreground">{option.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Instructions */}
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <CardTitle>Tailored Instructions</CardTitle>
          </div>
          <CardDescription>
            Provide specific guidelines for Metis to follow. Repository context files (e.g., AGENTS.md) are automatically detected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Enter specific coding standards, architectural patterns, or focus areas for Metis..."
            className="min-h-[120px] border-2 border-black resize-none focus-visible:ring-0 focus-visible:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          />
          <div className="mt-4 flex justify-end">
            <Button className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all">
              Save Instructions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Incremental Commits */}
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <GitCommit className="h-6 w-6" />
                <CardTitle>Continuous Review</CardTitle>
              </div>
              <CardDescription>
                Analyze new commits pushed to existing PRs. If disabled, Metis only reviews the initial pull request.
              </CardDescription>
            </div>
            <Switch className="scale-125" />
          </div>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded border border-gray-200">
             Metis will only comment on new issues introduced in subsequent commits to minimize noise.
           </p>
        </CardContent>
      </Card>

      {/* Ignore Patterns */}
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ban className="h-6 w-6" />
            <CardTitle>Exclusion Rules</CardTitle>
          </div>
          <CardDescription>Specify file patterns that Metis should skip during reviews.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="e.g., *.test.ts, vendor/*" 
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              className="border-2 border-black focus-visible:ring-0"
            />
            <Button 
              onClick={addPattern}
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {ignorePatterns.map((pattern) => (
              <Badge key={pattern} variant="neutral" className="pl-3 pr-1 py-1 h-8 border-2 border-black bg-gray-100 text-sm flex items-center gap-2">
                {pattern}
                <Button 
                  variant="noShadow" 
                  size="icon" 
                  className="h-5 w-5 hover:bg-red-100 hover:text-red-600 rounded-full"
                  onClick={() => removePattern(pattern)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
