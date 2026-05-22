import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { WaveBackground }  from '@/components/ui/WaveBackground';
import { StarCometOverlay } from '@/components/ui/StarCometOverlay';
import { DragonBot } from '@/components/chat/DragonBot';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: 'hsl(0 0% 3%)' }}>
      {/* Original wave background — before nebula */}
      <WaveBackground />
      {/* Stars & comets overlay */}
      <StarCometOverlay starCount={100} cometCount={8} />

      <Header />
      <main className="relative z-10 pt-20 pb-12 flex-1">
        {children}
      </main>
      <Footer />
      <DragonBot />
    </div>
  );
}
