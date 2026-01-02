'use client';
import WalletProvider from '../src/components/WalletProvider';
import Header from '../src/components/Header';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-6 pb-24">
          {children}
        </main>
      </div>
    </WalletProvider>
  );
}
