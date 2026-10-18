import { Route, Routes } from 'react-router-dom';
import { DocsLayout } from '@/components/documentation/DocsLayout';
import { SiteLayout } from '@/components/layout/SiteLayout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ArchitecturePage } from '@/pages/documentation/ArchitecturePage';
import { ConfigurationPage } from '@/pages/documentation/ConfigurationPage';
import { GitHubAppPage } from '@/pages/documentation/GitHubAppPage';
import { IntroductionPage } from '@/pages/documentation/IntroductionPage';
import { QuickstartPage } from '@/pages/documentation/QuickstartPage';

/** Router-agnostic route tree, shared by the browser entry and the prerenderer. */
export function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="docs" element={<DocsLayout />}>
          <Route index element={<IntroductionPage />} />
          <Route path="quickstart" element={<QuickstartPage />} />
          <Route path="github-app" element={<GitHubAppPage />} />
          <Route path="configuration" element={<ConfigurationPage />} />
          <Route path="architecture" element={<ArchitecturePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
