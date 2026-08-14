import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* brilho verde saindo do topo, esvaindo no escuro (em todas as abas) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-primary/10 via-primary/[0.03] to-transparent"
      />
      <Header />
      <main className="relative z-10 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
