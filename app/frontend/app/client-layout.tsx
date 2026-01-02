'use client';
import WalletProvider from '../src/components/WalletProvider';
import Header from '../src/components/Header';
import { ToastProvider } from '../src/components/Toast';
import { AnimatedMeshBackground } from '../src/components/AnimatedMesh';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <WalletProvider>
        <div className="min-h-screen flex flex-col relative">
          <AnimatedMeshBackground />
          <Header />
          <main className="flex-grow container mx-auto px-6 pb-24 relative z-10">
            {children}
          </main>
        </div>
      </WalletProvider>
    </ToastProvider>
  );
}
