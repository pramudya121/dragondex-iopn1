import { ReactNode } from 'react';
import { Header } from './Header';
import { WaveBackground } from '@/components/ui/WaveBackground';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen wave-bg relative">
      <WaveBackground />
      <Header />
      <main className="relative z-10 pt-20 pb-12">
        {children}
      </main>
    </div>
  );
}
