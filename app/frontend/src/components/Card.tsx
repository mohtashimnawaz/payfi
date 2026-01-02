import React from 'react';

export default function Card({ 
  title, 
  children, 
  icon,
  badge
}: { 
  title: string
  children: React.ReactNode
  icon?: React.ReactNode
  badge?: string
}) {
  return (
    <div className="card group relative overflow-hidden">
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-100 group-hover:text-purple-300 transition-colors">{title}</h3>
            {badge && <span className="badge mt-2">{badge}</span>}
          </div>
          {icon && <div className="text-2xl opacity-70 group-hover:opacity-100 transition-opacity">{icon}</div>}
        </div>
        <div className="text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}
