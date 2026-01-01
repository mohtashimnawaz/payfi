import React from 'react';

export default function BentoGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16}}>
      {children}
    </div>
  );
}
