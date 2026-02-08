import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRepository } from '@/contexts/RepositoryContext';
import { apiClient } from '@/lib/api-client';
import type { AnalyticsOverviewResponse, ReviewCommentWithContext } from '@/types/api';
import { AnalyticsStatisticsTab } from '@/components/dashboard/analytics/AnalyticsStatisticsTab';
import { AnalyticsIssuesTab } from '@/components/dashboard/analytics/AnalyticsIssuesTab';

export const AnalyticsPage: React.FC = () => {
  const { selectedRepo } = useRepository();
  const [recentComments, setRecentComments] = useState<ReviewCommentWithContext[]>([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const COMMENTS_PAGE_SIZE = 5;

  useEffect(() => {
    const fetchOverview = async () => {
      if (!selectedRepo) {
        setOverview(null);
        setOverviewError(null);
        return;
      }

      setOverviewLoading(true);
      setOverviewError(null);
      try {
        const response = await apiClient.getAnalyticsOverview(selectedRepo.repository);
        setOverview(response);
      } catch (error) {
        setOverviewError(
          error instanceof Error ? error.message : 'Failed to load analytics overview'
        );
      } finally {
        setOverviewLoading(false);
      }
    };

    fetchOverview();
  }, [selectedRepo]);

  useEffect(() => {
    const fetchRecentComments = async () => {
      if (!selectedRepo) {
        setRecentComments([]);
        setCommentsTotal(0);
        setCommentsPage(1);
        setCommentsError(null);
        return;
      }

      setCommentsLoading(true);
      setCommentsError(null);

      try {
        const response = await apiClient.listReviewComments({
          repository: selectedRepo.repository,
          page: commentsPage,
          page_size: COMMENTS_PAGE_SIZE,
        });
        setRecentComments(response.items);
        setCommentsTotal(response.total);
      } catch (error) {
        setCommentsError(error instanceof Error ? error.message : 'Failed to load review comments');
      } finally {
        setCommentsLoading(false);
      }
    };

    fetchRecentComments();
  }, [selectedRepo, commentsPage]);

  useEffect(() => {
    setCommentsPage(1);
  }, [selectedRepo?.repository]);

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="landing-display text-3xl font-black text-black">Analytics</h1>
        <p className="text-black/60 font-medium">Overview of your code quality and team velocity.</p>
      </div>

      <Tabs defaultValue="statistics">
        <div className="flex justify-center">
          <TabsList className="grid w-full grid-cols-2 border-2 border-black bg-white p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-auto">
            <TabsTrigger
              value="statistics"
              className="font-bold text-xs sm:text-sm data-[state=active]:bg-[var(--metis-pastel-2)] data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-sm transition-all py-2"
            >
              Statistics
            </TabsTrigger>
            <TabsTrigger
              value="issues"
              className="font-bold text-xs sm:text-sm data-[state=active]:bg-[var(--metis-pastel-2)] data-[state=active]:text-black data-[state=active]:border-2 data-[state=active]:border-black data-[state=active]:shadow-sm transition-all py-2"
            >
              AI Detected Issues
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="statistics">
          <AnalyticsStatisticsTab
            selectedRepository={selectedRepo?.repository ?? null}
            overview={overview}
            loading={overviewLoading}
            error={overviewError}
          />
        </TabsContent>

        <TabsContent value="issues">
          <AnalyticsIssuesTab
            selectedRepository={selectedRepo?.repository ?? null}
            comments={recentComments}
            page={commentsPage}
            pageSize={COMMENTS_PAGE_SIZE}
            total={commentsTotal}
            onPageChange={setCommentsPage}
            loading={commentsLoading}
            error={commentsError}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
