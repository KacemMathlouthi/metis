import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './Sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentPage = pathSegments[pathSegments.length - 1];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="landing bg-[var(--metis-cream)]">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b-2 border-black bg-white/90 backdrop-blur transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 border-2 border-black bg-white shadow-[2px_2px_0px_0px_#000]" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard" className="font-semibold">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathSegments.length > 1 && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="capitalize font-semibold text-[var(--metis-red)]">
                        {currentPage.replace('-', ' ')}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
