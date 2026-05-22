import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { NebulaBackground } from '@/components/chat/NebulaBackground';
import { DragonBot } from '@/components/chat/DragonBot';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: 'hsl(0 0% 3%)' }}>
      {/* Fixed nebula backdrop — covers entire viewport, stays put on scroll */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <NebulaBackground starCount={120} cometCount={10} />
      </div>

      <Header />
      <main className="relative z-10 pt-20 pb-12 flex-1">
        {children}
      </main>
      <Footer />
      <DragonBot />
    </div>
  );
}
