'use client';
import WalletProvider from '../src/components/WalletProvider';
import Header from '../src/components/Header';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <div className="container mx-auto px-4 py-6">
        <Header />
        <main className="mt-6">
          {children}
        </main>
      </div>
    </WalletProvider>
  );
}
