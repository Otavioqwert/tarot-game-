import React, { useMemo } from 'react';
import { Card } from '../types';

interface TooltipProps {
  card: Card;
}

interface EffectTag {
  text: string;
  type: 'buff' | 'resource' | 'sync' | 'time' | 'meta' | 'element' | 'special';
}

const parseEffectForTags = (card: Card): EffectTag[] => {
  const tags: EffectTag[] = [];
  const effect = card.effect.toLowerCase();

  // Basic stats
  tags.push({ text: card.element, type: 'element' });
  tags.push({ text: `Sync: ${card.syncType}`, type: 'sync' });

  // Numerical buffs
  if (effect.includes('+1 soma numérica')) {
    tags.push({ text: '+1 Efeito', type: 'buff' });
  }
  const percentMatches = effect.match(/\+\d+%/g);
  if (percentMatches) {
    percentMatches.forEach(match => tags.push({ text: match, type: 'sync' }));
  }

  // Resource generation
  if (effect.includes('recursos') || effect.includes('aether')) {
    tags.push({ text: 'Gera ✨', type: 'resource' });
  }

  // Time manipulation
  if (effect.includes('ciclos') || effect.includes('cooldown')) {
    tags.push({ text: 'Tempo ⌛', type: 'time' });
  }

  // Meta effects
  if (effect.includes('copia') || effect.includes('replica')) {
    tags.push({ text: 'Cópia', type: 'meta' });
  }
  if (effect.includes('dobra')) {
    tags.push({ text: 'x2 Efeito', type: 'meta' });
  }
  if (effect.includes('consome')) {
    tags.push({ text: 'Consome', type: 'special' });
  }
  if (effect.includes('equaliza')) {
    tags.push({ text: 'Equaliza', type: 'meta' });
  }
  
  // Specific card effects
  if (card.effectId === 'THE_EMPEROR') {
      tags.push({ text: '+Sinergia', type: 'buff' });
  }
  if (card.effectId === 'THE_TOWER') {
      tags.push({ text: 'Aleatório', type: 'special' });
  }
  if (card.effectId === 'THE_LOVERS') {
      tags.push({ text: 'Escolha', type: 'meta' });
  }


  return tags.slice(0, 4); // Limit to 4 tags for cleanliness
};

const getTagClasses = (type: EffectTag['type']): string => {
  switch (type) {
    case 'buff': return 'bg-red-800/80 border-red-500/50 text-red-200';
    case 'resource': return 'bg-amber-800/80 border-amber-500/50 text-amber-200';
    case 'sync': return 'bg-indigo-800/80 border-indigo-500/50 text-indigo-200';
    case 'time': return 'bg-cyan-800/80 border-cyan-500/50 text-cyan-200';
    case 'meta': return 'bg-purple-800/80 border-purple-500/50 text-purple-200';
    case 'element': return 'bg-slate-700/80 border-slate-500/50 text-slate-300';
    case 'special': return 'bg-fuchsia-800/80 border-fuchsia-500/50 text-fuchsia-200';
    default: return 'bg-gray-700';
  }
};

const CardTooltip: React.FC<TooltipProps> = ({ card }) => {
  const tags = useMemo(() => parseEffectForTags(card), [card]);

  return (
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max flex flex-col items-center
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                    transition-opacity duration-200 pointer-events-none z-20">
      <div className="flex space-x-1 bg-slate-950/90 border border-slate-700 p-1.5 rounded-lg shadow-lg backdrop-blur-sm">
        {tags.map((tag) => (
          <span key={tag.text} className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getTagClasses(tag.type)}`}>
            {tag.text}
          </span>
        ))}
      </div>
      <div className="w-2 h-2 bg-slate-950 border-b border-r border-slate-700 transform rotate-45 -mt-1"/>
    </div>
  );
};

export default CardTooltip;