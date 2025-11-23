import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  BarChart3,
  LogOut,
  GitPullRequest,
  CheckCircle2,
  ChevronsUpDown,
  Plus,
  Sparkles,
  BadgeCheck,
  CreditCard,
  Bell,
  Code2,
  FileDiff,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
} from "@/components/ui/sidebar"

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { isMobile } = useSidebar()
  const [activeRepo, setActiveRepo] = React.useState({
    name: "metis-frontend",
    logo: Code2,
    plan: "Pro",
  })

  const repositories = [
    {
      name: "metis-frontend",
      logo: Code2,
      plan: "Pro",
    },
    {
      name: "metis-backend",
      logo: Code2,
      plan: "Free",
    },
    {
      name: "metis-docs",
      logo: Code2,
      plan: "Free",
    },
  ]

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Bot, label: 'AI Review', href: '/dashboard/ai-review' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1 group-data-[collapsible=icon]:justify-center">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-white text-lg font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            M
          </div>
          <span className="text-xl font-black italic tracking-tighter group-data-[collapsible=icon]:hidden">METIS</span>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-gray-100 data-[state=open]:text-black"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-data-[collapsible=icon]:!border-0 group-data-[collapsible=icon]:!shadow-none">
                    <activeRepo.logo className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">
                      {activeRepo.name}
                    </span>
                    <span className="truncate text-xs">{activeRepo.plan}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border-2 border-black bg-white p-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                align="start"
                side={isMobile ? "bottom" : "right"}
                sideOffset={4}
              >
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Repositories
                </DropdownMenuLabel>
                {repositories.map((repo) => (
                  <DropdownMenuItem
                    key={repo.name}
                    onClick={() => setActiveRepo(repo)}
                    className="gap-2 p-2 bg-white hover:bg-gray-100"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm border border-black">
                      <repo.logo className="size-4 shrink-0" />
                    </div>
                    {repo.name}
                    <DropdownMenuShortcut>⌘{repo.name.substring(0, 1).toUpperCase()}</DropdownMenuShortcut>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-black" />
                <DropdownMenuItem className="gap-2 p-2 bg-white hover:bg-gray-100">
                  <div className="flex size-6 items-center justify-center rounded-md border border-black bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">Add repository</div>
                </DropdownMenuItem>
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
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
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
                <span className="text-lg font-black text-black">12</span>
              </div>
              <div className="flex flex-col rounded-md border-2 border-black bg-[#F472B6] p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-1 text-[10px] font-bold text-black">
                  <CheckCircle2 className="h-3 w-3" />
                  Fixed
                </div>
                <span className="text-lg font-black text-black">5</span>
              </div>
              <div className="flex flex-col rounded-md border-2 border-black bg-[#4ADE80] p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-1 text-[10px] font-bold text-black">
                  <Code2 className="h-3 w-3" />
                  Added
                </div>
                <span className="text-lg font-black text-black">+450</span>
              </div>
              <div className="flex flex-col rounded-md border-2 border-black bg-white p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-1 text-[10px] font-bold text-black">
                  <FileDiff className="h-3 w-3" />
                  Removed
                </div>
                <span className="text-lg font-black text-black">-120</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-gray-100 data-[state=open]:text-black"
                >
                  <Avatar className="h-8 w-8 rounded-lg border-2 border-black">
                    <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                    <AvatarFallback className="rounded-lg">KM</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">Kacem Mathlouthi</span>
                    <span className="truncate text-xs">kacem@metis.ai</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border-2 border-black bg-white p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg border-2 border-black">
                      <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                      <AvatarFallback className="rounded-lg">KM</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">Kacem Mathlouthi</span>
                      <span className="truncate text-xs">kacem@metis.ai</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-black" />
                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuItem className="rounded-md border-2 border-transparent bg-white font-bold text-black focus:border-black focus:bg-gray-100">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-black" />
                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuItem className="rounded-md border-2 border-transparent bg-white font-bold text-black focus:border-black focus:bg-gray-100">
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-md border-2 border-transparent bg-white font-bold text-black focus:border-black focus:bg-gray-100">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-md border-2 border-transparent bg-white font-bold text-black focus:border-black focus:bg-gray-100">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-black" />
                <DropdownMenuItem className="rounded-md border-2 border-transparent bg-white font-bold text-red-600 focus:border-black focus:bg-gray-100">
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
