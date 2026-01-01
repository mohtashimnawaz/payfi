import '../styles/globals.css'
import React from 'react'

export const metadata = {
  title: 'PayFi Frontend',
  description: 'Empty PayFi frontend scaffold (bento layout to add)'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main style={{padding: 24, fontFamily: 'Inter, system-ui, sans-serif'}}>
          {children}
        </main>
      </body>
    </html>
  )
}
