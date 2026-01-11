import React from 'react';
import { useStreamStore } from '../store/useStreamStore';
import { LayoutGrid, Maximize, Layout } from 'lucide-react';

export const LayoutSelector: React.FC = () => {
  const { layoutType, setLayoutType } = useStreamStore();

  const layouts = [
    { id: 'grid', icon: LayoutGrid, label: 'Grade Padrão' },
    { id: 'featured', icon: Maximize, label: 'Vista em Destaque' },
    { id: 'sidebar', icon: Layout, label: 'Foco na Lateral' },
  ] as const;

  return (
    <div className="flex items-center gap-1 p-1 bg-surface rounded-full border border-border/50">
      {layouts.map((l) => (
        <button
          key={l.id}
          onClick={() => setLayoutType(l.id)}
          title={l.label}
          className={`p-1.5 rounded-full transition-all ${
            layoutType === l.id
              ? 'bg-neutral-100 text-background shadow-sm'
              : 'text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          <l.icon size={14} />
        </button>
      ))}
    </div>
  );
};
