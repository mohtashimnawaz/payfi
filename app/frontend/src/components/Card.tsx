import React from 'react';

export default function Card({ 
  title, 
  children, 
  badge,
  className = ""
}: { 
  title: string
  children: React.ReactNode
  badge?: string
  className?: string
}) {
  return (
    <div className={`card group ${className}`}>
      {badge && <div className="badge mb-6">{badge}</div>}
      <h3 className="text-2xl font-medium text-body mb-4">{title}</h3>
      <div className="text-muted leading-relaxed">
        {children}
      </div>
    </div>
  );
}
