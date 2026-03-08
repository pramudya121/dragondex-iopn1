import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { AnimatePresence } from 'framer-motion';
import { config } from '@/config/wagmi';
import { Layout } from '@/components/layout/Layout';
import { PageTransition } from '@/components/layout/PageTransition';
import Index from "./pages/Index";
import Swap from "./pages/Swap";
import Liquidity from "./pages/Liquidity";
import Pools from "./pages/Pools";
import Analytics from "./pages/Analytics";
import Portfolio from "./pages/Portfolio";
import CreatePool from "./pages/CreatePool";
import Docs from "./pages/Docs";
import Farming from "./pages/Farming";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/swap" element={<PageTransition><Swap /></PageTransition>} />
        <Route path="/liquidity" element={<PageTransition><Liquidity /></PageTransition>} />
        <Route path="/pools" element={<PageTransition><Pools /></PageTransition>} />
        <Route path="/create-pool" element={<PageTransition><CreatePool /></PageTransition>} />
        <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
        <Route path="/portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
        <Route path="/docs" element={<PageTransition><Docs /></PageTransition>} />
        <Route path="/farming" element={<PageTransition><Farming /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
