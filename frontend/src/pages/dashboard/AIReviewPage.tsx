import React, { useState, useEffect } from 'react';
import { Bot, Zap, FileText, GitCommit, Ban, Plus, Trash2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UnsavedChangesBar } from '@/components/UnsavedChangesBar';

import { useRepository } from '@/contexts/RepositoryContext';
import { useToast } from '@/contexts/ToastContext';
import { apiClient } from '@/lib/api-client';

import type { InstallationConfig } from '@/types/api';

export const AIReviewPage: React.FC = () => {
  const { selectedRepo } = useRepository();
  const toast = useToast();

  // Form state
  const [sensitivity, setSensitivity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [customInstructions, setCustomInstructions] = useState('');
  const [autoReview, setAutoReview] = useState(true);
  const [ignorePatterns, setIgnorePatterns] = useState<string[]>([]);
  const [newPattern, setNewPattern] = useState('');

  // Track original state for dirty checking
  const [originalConfig, setOriginalConfig] = useState<InstallationConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load config from selected installation
  useEffect(() => {
    if (selectedRepo) {
      const config = selectedRepo.config;
      setSensitivity(config.sensitivity as 'LOW' | 'MEDIUM' | 'HIGH');
      setCustomInstructions(config.custom_instructions);
      setIgnorePatterns(config.ignore_patterns);
      setAutoReview(config.auto_review_enabled);
      setOriginalConfig(config);
      setHasChanges(false);
    }
  }, [selectedRepo]);

  // Check for changes (deep equality check ignoring key order)
  useEffect(() => {
    if (!originalConfig) return;

    const changed =
      sensitivity !== originalConfig.sensitivity ||
      customInstructions !== originalConfig.custom_instructions ||
      autoReview !== originalConfig.auto_review_enabled ||
      JSON.stringify([...ignorePatterns].sort()) !==
        JSON.stringify([...originalConfig.ignore_patterns].sort());

    setHasChanges(changed);
  }, [sensitivity, customInstructions, ignorePatterns, autoReview, originalConfig]);

  const addPattern = () => {
    if (newPattern && !ignorePatterns.includes(newPattern)) {
      setIgnorePatterns([...ignorePatterns, newPattern]);
      setNewPattern('');
    }
  };

  const removePattern = (pattern: string) => {
    setIgnorePatterns(ignorePatterns.filter((p) => p !== pattern));
  };

  const handleSave = async () => {
    if (!selectedRepo) {
      toast.error('No Repository Selected', 'Please select a repository first');
      return;
    }

    setSaving(true);
    const loadingId = toast.loading('Saving configuration...', 'Updating review settings');

    try {
      const config: InstallationConfig = {
        sensitivity: sensitivity,
        custom_instructions: customInstructions,
        ignore_patterns: ignorePatterns,
        auto_review_enabled: autoReview,
      };

      await apiClient.updateInstallationConfig(selectedRepo.id, config);

      setOriginalConfig(config);
      setHasChanges(false);

      toast.dismiss(loadingId);
      toast.success('Configuration Saved', 'Review settings updated successfully');
    } catch (err) {
      toast.dismiss(loadingId);
      toast.error('Save Failed', err instanceof Error ? err.message : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    if (!originalConfig) return;

    setSensitivity(originalConfig.sensitivity as 'LOW' | 'MEDIUM' | 'HIGH');
    setCustomInstructions(originalConfig.custom_instructions);
    setIgnorePatterns(originalConfig.ignore_patterns);
    setAutoReview(originalConfig.auto_review_enabled);
    setHasChanges(false);

    toast.info('Changes Reverted', 'Configuration reset to last saved state');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-2">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black">Review Configuration</h1>
        <p className="text-muted-foreground">
          Customize Metis's code review behavior and preferences.
        </p>
      </div>

      {/* AI Agent Info */}
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6" />
            <CardTitle>Metis Agent Capabilities</CardTitle>
          </div>
          <CardDescription>
            Automated feedback on pull requests with actionable insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-md border-2 border-black bg-blue-50 p-4">
            <div className="mt-1 rounded-full bg-blue-200 p-1">
              <Sparkles className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-bold">On-Demand Reviews</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Mention{' '}
                <Badge variant="neutral" className="border-black bg-white text-xs">
                  @metis-ai
                </Badge>{' '}
                in any pull request to trigger a fresh review, ask for clarification, or request
                code changes.
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                id: 'LOW',
                label: 'Low',
                desc: 'Focuses only on critical bugs and major security flaws.',
              },
              {
                id: 'MEDIUM',
                label: 'Default',
                desc: 'Standard analysis balancing comprehensive checks with noise reduction.',
              },
              {
                id: 'HIGH',
                label: 'High',
                desc: 'Exhaustive review covering style, minor optimizations, and potential edge cases.',
              },
            ].map((option) => (
              <div
                key={option.id}
                onClick={() => setSensitivity(option.id as 'LOW' | 'MEDIUM' | 'HIGH')}
                className={`cursor-pointer rounded-md border-2 p-4 transition-all ${
                  sensitivity === option.id
                    ? 'border-black bg-[#FCD34D] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-gray-200 hover:border-black hover:bg-gray-50'
                } `}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-bold">{option.label}</span>
                  {sensitivity === option.id && <div className="h-3 w-3 rounded-full bg-black" />}
                </div>
                <p className="text-muted-foreground text-xs">{option.desc}</p>
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
            Provide specific guidelines for Metis to follow. Repository context files (e.g.,
            AGENTS.md) are automatically detected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Enter specific coding standards, architectural patterns, or focus areas for Metis..."
            className="min-h-[120px] resize-none border-2 border-black focus-visible:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0"
          />
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
                Analyze new commits pushed to existing PRs. If disabled, Metis only reviews the
                initial pull request.
              </CardDescription>
            </div>
            <Switch checked={autoReview} onCheckedChange={setAutoReview} className="scale-125" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground rounded border border-gray-200 bg-gray-50 p-3 text-sm">
            Metis will only comment on new issues introduced in subsequent commits to minimize
            noise.
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
          <CardDescription>
            Specify file patterns that Metis should skip during reviews.
          </CardDescription>
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
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[1px] hover:shadow-none"
            >
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {ignorePatterns.map((pattern) => (
              <Badge
                key={pattern}
                variant="neutral"
                className="flex h-8 items-center gap-2 border-2 border-black bg-gray-100 py-1 pr-1 pl-3 text-sm"
              >
                {pattern}
                <Button
                  variant="noShadow"
                  size="icon"
                  className="h-5 w-5 rounded-full hover:bg-red-100 hover:text-red-600"
                  onClick={() => removePattern(pattern)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Bar */}
      {hasChanges && (
        <UnsavedChangesBar
          onSave={handleSave}
          onRevert={handleRevert}
          saving={saving}
        />
      )}
    </div>
  );
};
