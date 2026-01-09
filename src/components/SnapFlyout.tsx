import React from 'react';
import { type Platform } from '../store/useStreamStore';

interface SnapFlyoutProps {
  isVisible: boolean;
  onHoverLayout: (layout: string | null) => void;
  onSelectLayout: (layout: Platform | 'grid' | 'featured' | 'sidebar' | 'columns' | 'interactive') => void;
}

export const SnapFlyout: React.FC<SnapFlyoutProps> = ({ isVisible, onHoverLayout, onSelectLayout }) => {
  if (!isVisible) return null;

  const layouts = [
    { id: 'grid', label: 'Grade 2x2', cells: [true, true, true, true] },
    { id: 'featured', label: 'Destaque', cells: [true, false, false, false], main: true },
    { id: 'sidebar', label: 'Lateral', cells: [true, false, false, false], side: true },
    { id: 'columns', label: 'Colunas', cells: [true, true, true, false] },
  ];

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-[2000] snap-flyout p-4 rounded-b-2xl flex gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
      {layouts.map((l) => (
        <button
          key={l.id}
          onMouseEnter={() => onHoverLayout(l.id)}
          onMouseLeave={() => onHoverLayout(null)}
          onClick={() => onSelectLayout(l.id as any)}
          className="snap-option flex flex-col items-center gap-2 group"
        >
          <div className="w-16 h-12 grid grid-cols-2 grid-rows-2 gap-1 p-1 rounded-md border border-white/10 group-hover:border-blue-500/50 transition-colors">
            {l.cells.map((active, i) => (
              <div 
                key={i} 
                className={`snap-option-cell ${active ? 'active' : 'opacity-20'} ${
                  l.main && i === 0 ? 'col-span-2 row-span-2' : 
                  l.side && i === 0 ? 'row-span-2' : ''
                }`} 
              />
            ))}
          </div>
          <span className="text-[10px] text-neutral-500 group-hover:text-blue-400 transition-colors uppercase font-bold tracking-wider">
            {l.label}
          </span>
        </button>
      ))}
    </div>
  );
};
