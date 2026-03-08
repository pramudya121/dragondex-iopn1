import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { WaveBackground } from '@/components/ui/WaveBackground';
import { DragonBot } from '@/components/chat/DragonBot';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen wave-bg relative flex flex-col">
      <WaveBackground />
      <Header />
      <main className="relative z-10 pt-20 pb-12 flex-1">
        {children}
      </main>
      <Footer />
      <DragonBot />
    </div>
  );
}
