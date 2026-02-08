import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  LogOut,
  GitPullRequest,
  CheckCircle2,
  ChevronsUpDown,
  Plus,
  Code2,
  AlertCircle,
  CircleDot,
  Clock3,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useRepository } from '@/contexts/RepositoryContext';
import { apiClient } from '@/lib/api-client';
import type { AnalyticsCardMetric } from '@/types/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
  SidebarRail,
} from '@/components/ui/sidebar';

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { isMobile } = useSidebar();
  const { user, logout } = useAuth();
  const { selectedRepo, setSelectedRepo, installations, loading } = useRepository();
  const [statsCards, setStatsCards] = useState<AnalyticsCardMetric[]>([]);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    const fetchSidebarStats = async () => {
      if (!selectedRepo?.repository) {
        setStatsCards([]);
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);
      try {
        const response = await apiClient.getSidebarAnalytics(selectedRepo.repository);
        setStatsCards(response.cards);
      } catch {
        setStatsCards([]);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchSidebarStats();
  }, [selectedRepo?.repository]);

  const statsMap = useMemo(() => {
    return new Map(statsCards.map((card) => [card.key, card]));
  }, [statsCards]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: GitPullRequest, label: 'AI Review', href: '/dashboard/ai-review' },
    { icon: CircleDot, label: 'Issues', href: '/dashboard/issues' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' }
  ];

  return (
    <Sidebar collapsible="icon" className="landing bg-[var(--metis-white)]">
      <SidebarHeader className="bg-[var(--metis-white)]">
        <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-gradient-to-br from-[var(--metis-yellow)] via-[var(--metis-orange-light)] to-[var(--metis-red)] text-lg font-black text-white shadow-[2px_2px_0px_0px_#000]">
            M
          </div>
          <span className="landing-display text-xl font-black tracking-tighter group-data-[collapsible=icon]:hidden">
            METIS
          </span>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-[var(--metis-pastel-1)] data-[state=open]:text-black"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-data-[collapsible=icon]:!border-0 group-data-[collapsible=icon]:!shadow-none">
                    <Code2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">
                      {selectedRepo?.repository || 'No repository'}
                    </span>
                    <span className="truncate text-xs">
                      {selectedRepo?.account_type || 'Select a repo'}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border-2 border-black bg-white p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                align="start"
                side={isMobile ? 'bottom' : 'right'}
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  {loading ? 'Loading...' : `Repositories (${installations.length})`}
                </DropdownMenuLabel>
                {installations.length === 0 && !loading && (
                  <div className="p-4 text-center text-sm text-black/60">
                    No repositories enabled.
                    <br />
                    <Link to="/dashboard/repositories" className="font-bold text-black underline">
                      Add your first repo →
                    </Link>
                  </div>
                )}
                {installations.map((installation) => (
                  <DropdownMenuItem
                    key={installation.id}
                    onClick={() => setSelectedRepo(installation)}
                    className={`gap-2 bg-white p-2 hover:bg-[var(--metis-pastel-1)] ${
                      selectedRepo?.id === installation.id ? 'bg-[var(--metis-pastel-2)]' : ''
                    }`}
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border border-black">
                      <Code2 className="size-4 shrink-0" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-semibold">{installation.repository}</span>
                      <span className="text-xs text-black/60">{installation.account_name}</span>
                    </div>
                    {selectedRepo?.id === installation.id && (
                      <CheckCircle2 className="size-4 text-[var(--metis-orange-dark)]" />
                    )}
                  </DropdownMenuItem>
                ))}
                {installations.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-black" />
                    <DropdownMenuItem asChild className="gap-2 bg-white p-2 hover:bg-[var(--metis-pastel-1)]">
                      <Link to="/dashboard/repositories">
                        <div className="bg-background flex size-6 items-center justify-center rounded-md border border-black">
                          <Plus className="size-4" />
                        </div>
                        <div className="text-muted-foreground font-medium">
                          Manage repositories
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link to={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Your Stats</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid grid-cols-2 gap-2 p-2">
              <div className="flex flex-col rounded-md border-2 border-black bg-white p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-1 text-[10px] font-bold text-black">
                  <GitPullRequest className="h-3 w-3" />
                  PRs
                </div>
                <span className="text-lg font-black text-black">
                  {statsLoading ? '...' : (statsMap.get('prs_reviewed')?.display_value ?? '--')}
                </span>
              </div>
              <div className="flex flex-col rounded-md border-2 border-black bg-[var(--metis-pastel-1)] p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-1 text-[10px] font-bold text-black">
                  <AlertCircle className="h-3 w-3" />
                  Findings
                </div>
                <span className="text-lg font-black text-black">
                  {statsLoading ? '...' : (statsMap.get('findings_detected')?.display_value ?? '--')}
                </span>
              </div>
              <div className="flex flex-col rounded-md border-2 border-black bg-[var(--metis-pastel-3)] p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-1 text-[10px] font-bold text-black">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </div>
                <span className="text-lg font-black text-black">
                  {statsLoading ? '...' : (statsMap.get('completed_reviews')?.display_value ?? '--')}
                </span>
              </div>
              <div className="flex flex-col rounded-md border-2 border-black bg-white p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-1 text-[10px] font-bold text-black">
                  <Clock3 className="h-3 w-3" />
                  Latency
                </div>
                <span className="text-lg font-black text-black">
                  {statsLoading ? '...' : (statsMap.get('avg_review_latency_seconds')?.display_value ?? '--')}
                </span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-[var(--metis-white)]">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-[var(--metis-pastel-1)] data-[state=open]:text-black"
                >
                  <Avatar className="h-8 w-8 rounded-lg border-2 border-black">
                    <AvatarImage src={user?.avatar_url || ''} alt={user?.username} />
                    <AvatarFallback className="rounded-lg">
                      {user?.username?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">{user?.username || 'User'}</span>
                    <span className="truncate text-xs">{user?.email || 'No email'}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border-2 border-black bg-white p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg border-2 border-black">
                      <AvatarImage src={user?.avatar_url || ''} alt={user?.username} />
                      <AvatarFallback className="rounded-lg">
                        {user?.username?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.username || 'User'}</span>
                      <span className="truncate text-xs">{user?.email || 'No email'}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-black" />
                {/* Manage Repositories Link */}
                <DropdownMenuItem asChild className="gap-2 bg-white p-2 hover:bg-[var(--metis-pastel-1)]">
                  <Link to="/dashboard/repositories">
                    <Plus className="size-4" />
                    <span className="font-semibold">Manage repositories</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-black" />
                <DropdownMenuItem
                  className="rounded-md border-2 border-transparent bg-white font-bold text-[var(--metis-red)] focus:border-black focus:bg-[var(--metis-pastel-1)] cursor-pointer"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
