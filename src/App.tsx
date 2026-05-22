import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';

import { config } from '@/config/wagmi';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary, RouteErrorBoundary } from '@/components/ErrorBoundary';
import Index from "./pages/Index";
import Swap from "./pages/Swap";
import Liquidity from "./pages/Liquidity";
import Pools from "./pages/Pools";
import Analytics from "./pages/Analytics";
import Portfolio from "./pages/Portfolio";
import CreatePool from "./pages/CreatePool";
import Docs from "./pages/Docs";
import Farming from "./pages/Farming";
import AdminFarming from "./pages/AdminFarming";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <RouteErrorBoundary>
      {children}
    </RouteErrorBoundary>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
      <Route path="/swap" element={<PageWrapper><Swap /></PageWrapper>} />
      <Route path="/liquidity" element={<PageWrapper><Liquidity /></PageWrapper>} />
      <Route path="/pools" element={<PageWrapper><Pools /></PageWrapper>} />
      <Route path="/create-pool" element={<PageWrapper><CreatePool /></PageWrapper>} />
      <Route path="/analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
      <Route path="/portfolio" element={<PageWrapper><Portfolio /></PageWrapper>} />
      <Route path="/docs" element={<PageWrapper><Docs /></PageWrapper>} />
      <Route path="/farming" element={<PageWrapper><Farming /></PageWrapper>} />
      <Route path="/admin/farming" element={<PageWrapper><AdminFarming /></PageWrapper>} />
      <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
    </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <AppRoutes />
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </ErrorBoundary>
);

export default App;
