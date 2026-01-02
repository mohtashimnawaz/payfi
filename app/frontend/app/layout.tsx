import '../styles/globals.css'
import React from 'react'
import dynamic from 'next/dynamic'

const ClientLayout = dynamic(() => import('./client-layout'), { ssr: false });

export const metadata = {
  title: 'PayFi Frontend',
  description: 'PayFi Frontend - Anchor Program Interaction'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-slate-900">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
