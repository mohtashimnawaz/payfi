import React from 'react';

export default function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{border: '1px solid #e5e7eb', padding: 16, borderRadius: 8, background: '#fff'}}>
      <h3 style={{marginTop: 0}}>{title}</h3>
      {children}
    </div>
  );
}
