import React, { useState, useEffect } from 'react';
import { Zap, FileText, Ban, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UnsavedChangesBar } from '@/components/UnsavedChangesBar';
import lechatGif from '@/assets/lechat.gif';

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
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="landing-display text-3xl font-black">Review Configuration</h1>
        <p className="text-black/60 font-medium">
          Customize Metis's code review behavior and preferences.
        </p>
      </div>

      {/* Metis Agent Capabilities section hidden for now */}

      {/* Sensitivity */}
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="relative pr-28">
          <img
            src={lechatGif}
            alt="LeChat agent"
            className="pointer-events-none absolute right-6 top-0 z-10 h-16 w-auto -translate-y-[calc(100%+10px)] -scale-x-100 md:right-8 md:h-20"
          />
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6" />
            <CardTitle className="font-black">Review Depth</CardTitle>
          </div>
          <CardDescription className="font-medium">Adjust the granularity and strictness of the analysis.</CardDescription>
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
                    ? 'border-black bg-[var(--metis-pastel-2)] shadow-[4px_4px_0px_0px_#000]'
                    : 'border-black/20 hover:border-black hover:bg-[var(--metis-pastel-1)] hover:shadow-[2px_2px_0px_0px_#000]'
                } `}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-black text-lg">{option.label}</span>
                  {sensitivity === option.id && <div className="h-3 w-3 rounded-full bg-black border border-black" />}
                </div>
                <p className={`text-xs font-medium ${sensitivity === option.id ? 'text-black' : 'text-gray-500'}`}>{option.desc}</p>
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
            <CardTitle className="font-black">Tailored Instructions</CardTitle>
          </div>
          <CardDescription className="font-medium">
            Provide specific guidelines for Metis to follow. Repository context files (e.g.,
            AGENTS.md) are automatically detected.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Enter specific coding standards, architectural patterns, or focus areas for Metis..."
            className="min-h-[120px] resize-none border-2 border-black focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 font-medium placeholder:text-gray-400"
          />
        </CardContent>
      </Card>

      {/* Incremental Commits
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <GitCommit className="h-6 w-6" />
                <CardTitle className="font-black">Continuous Review</CardTitle>
              </div>
              <CardDescription className="font-medium">
                Analyze new commits pushed to existing PRs. If disabled, Metis only reviews the
                initial pull request.
              </CardDescription>
            </div>
            <Switch checked={autoReview} onCheckedChange={setAutoReview} className="scale-125 border-2 border-black" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 font-medium rounded border-2 border-gray-200 bg-gray-50 p-3 text-sm">
            Metis will only comment on new issues introduced in subsequent commits to minimize
            noise.
          </p>
        </CardContent>
      </Card> */}

      {/* Ignore Patterns */}
      <Card className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ban className="h-6 w-6" />
            <CardTitle className="font-black">Exclusion Rules</CardTitle>
          </div>
          <CardDescription className="font-medium">
            Specify file patterns that Metis should skip during reviews.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., *.test.ts, vendor/*"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              className="border-2 border-black focus-visible:ring-0 font-medium"
            />
            <Button
              onClick={addPattern}
              className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-y-[1px] hover:shadow-none font-bold"
            >
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {ignorePatterns.map((pattern) => (
              <Badge
                key={pattern}
                variant="neutral"
                className="flex h-8 items-center gap-2 border-2 border-black bg-gray-100 py-1 pr-1 pl-3 text-sm font-bold"
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
