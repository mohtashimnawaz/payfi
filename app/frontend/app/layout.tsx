import '../styles/globals.css'
import React from 'react'
import dynamic from 'next/dynamic'
const WalletProvider = dynamic(() => import('../src/components/WalletProvider'), { ssr: false });

export const metadata = {
  title: 'PayFi Frontend',
  description: 'Empty PayFi frontend scaffold (bento layout to add)'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main style={{padding: 24, fontFamily: 'Inter, system-ui, sans-serif'}}>
          {/* WalletProvider is a client component that renders the connect button */}
          <WalletProvider>
            {children}
          </WalletProvider>
        </main>
      </body>
    </html>
  );
}
