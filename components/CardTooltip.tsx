import React, { useMemo } from 'react';
import { Card, CircleSlot, CardInstance } from '../types';
import { TAROT_LIBRARY, LUNAR_MAX } from '../constants';
import { ActiveSynergy } from '../synergies';

interface TooltipProps {
  card: Card;
  slotIndex?: number;
  slots?: CircleSlot[];
  globalHours?: number;
  activeSynergies?: ActiveSynergy[];
}

interface EffectTag {
  text: string;
  type: 'buff' | 'resource' | 'sync' | 'time' | 'meta' | 'element' | 'special';
}

const parseEffectForTags = (card: Card): EffectTag[] => {
  const tags: EffectTag[] = [];
  const effect = card.effect.toLowerCase();

  tags.push({ text: card.element, type: 'element' });
  tags.push({ text: `Sync: ${card.syncType}`, type: 'sync' });

  if (effect.includes('+1 soma numérica')) {
    tags.push({ text: '+1 Efeito', type: 'buff' });
  }
  const percentMatches = effect.match(/\+\d+%/g);
  if (percentMatches) {
    percentMatches.forEach(match => tags.push({ text: match, type: 'sync' }));
  }

  if (effect.includes('recursos') || effect.includes('aether')) {
    tags.push({ text: 'Gera ✨', type: 'resource' });
  }

  if (effect.includes('ciclos') || effect.includes('cooldown')) {
    tags.push({ text: 'Tempo ⌛', type: 'time' });
  }

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
  
  if (card.effectId === 'THE_EMPEROR') {
      tags.push({ text: '+Sinergia', type: 'buff' });
  }
  if (card.effectId === 'THE_TOWER') {
      tags.push({ text: 'Aleatório', type: 'special' });
  }
  if (card.effectId === 'THE_LOVERS') {
      tags.push({ text: 'Escolha', type: 'meta' });
  }

  return tags.slice(0, 4);
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

const getCardName = (instance: CardInstance | null | undefined): string => {
  if (!instance) return 'Vazio';
  const data = TAROT_LIBRARY.find(c => c.id === instance.cardId);
  return data?.name || 'Desconhecido';
};

const getAdjacentCards = (
  slots: CircleSlot[] | undefined,
  index: number
): { left: CardInstance | null; right: CardInstance | null } => {
  if (!Array.isArray(slots) || slots.length === 0) return { left: null, right: null };
  const n = slots.length;
  const left = slots[(index - 1 + n) % n]?.card || null;
  const right = slots[(index + 1) % n]?.card || null;
  return { left, right };
};

const buildLiveSummary = (
  card: Card,
  slotIndex?: number,
  slots?: CircleSlot[],
  globalHours?: number
): string[] => {
  if (slotIndex === undefined || !Array.isArray(slots) || slots.length === 0 || globalHours === undefined) return [];

  const lines: string[] = [];
  const instance = slots[slotIndex]?.card || null;
  const { left, right } = getAdjacentCards(slots, slotIndex);

  switch (card.effectId) {
    case 'THE_EMPRESS': {
      lines.push(`Copia o ciclo da carta à direita: ${getCardName(right)}.`);
      break;
    }
    case 'THE_MAGICIAN': {
      lines.push(`Dobra recursos e sincronia da carta à direita: ${getCardName(right)}.`);
      break;
    }
    case 'STRENGTH': {
      if (!left && !right) {
        lines.push('Sem alvos adjacentes no momento.');
      } else {
        lines.push(`Fortalece cartas adjacentes: esquerda ${getCardName(left)}, direita ${getCardName(right)}.`);
      }
      break;
    }
    case 'JUDGEMENT': {
      if (!left && !right) {
        lines.push('Sem alvos adjacentes para replicar.');
      } else {
        lines.push(`Replica 50% dos adjacentes (esq: ${getCardName(left)}, dir: ${getCardName(right)}) e reduz esses alvos em 25%.`);
      }
      break;
    }
    case 'DEATH': {
      const hoursInMoon = globalHours % LUNAR_MAX;
      const cyclesToNewMoonRaw = hoursInMoon === 0 && globalHours > 0 ? 0 : (LUNAR_MAX - hoursInMoon) % LUNAR_MAX;
      const cyclesToNewMoon = cyclesToNewMoonRaw === 0 && globalHours > 0 ? LUNAR_MAX : cyclesToNewMoonRaw;
      lines.push(`Na próxima Lua Nova em ~${cyclesToNewMoon || LUNAR_MAX} ciclos consumirá a carta à esquerda: ${getCardName(left)}.`);
      break;
    }
    case 'JUSTICE': {
      const hourInMoon = globalHours % LUNAR_MAX;
      const mod = hourInMoon % 7;
      const cyclesToNext = (7 - mod) % 7;
      const effective = cyclesToNext === 0 && hourInMoon > 0 ? 7 : cyclesToNext || 7;
      lines.push(`Próximo ganho de 25 ✨ e +1% Sync em ~${effective} ciclos lunares.`);
      break;
    }
    case 'THE_TOWER': {
      const mod = globalHours % 8;
      const cyclesToReorgRaw = (8 - mod) % 8;
      const cyclesToReorg = cyclesToReorgRaw === 0 && globalHours > 0 ? 8 : cyclesToReorgRaw || 8;
      lines.push(`Reorganiza o círculo em ~${cyclesToReorg} ciclos.`);
      lines.push('15% de chance de ativar modo Arcano Maior ao reorganizar.');
      break;
    }
    case 'WHEEL_OF_FORTUNE': {
      const markedCards = slots.filter(s => s.card?.marks && Array.isArray(s.card.marks) && s.card.marks.length > 0).length;
      if (markedCards > 0) {
        lines.push(`Afeta ${markedCards} carta(s) marcada(s), multiplicando recursos conforme Sync global.`);
      } else {
        lines.push('Nenhuma marca ativa no círculo; aguardando marcas para amplificar recursos.');
      }
      break;
    }
    default: {
      if (instance?.cooldownUntil && instance.cooldownUntil > globalHours) {
        lines.push(`Em recarga por mais ${instance.cooldownUntil - globalHours} ciclos.`);
      }
      break;
    }
  }

  return lines;
};

const CardTooltip: React.FC<TooltipProps> = ({ card, slotIndex, slots, globalHours, activeSynergies = [] }) => {
  const tags = useMemo(() => parseEffectForTags(card), [card]);
  const liveSummary = useMemo(
    () => buildLiveSummary(card, slotIndex, slots, globalHours),
    [card, slotIndex, slots, globalHours]
  );

  const effectId = card.effectId;
  const synergiesForThisCard = effectId && Array.isArray(activeSynergies)
    ? activeSynergies.filter(s => s.cards && Array.isArray(s.cards) && s.cards.includes(effectId))
    : [];

  const instance = slotIndex !== undefined && Array.isArray(slots) ? slots[slotIndex]?.card : null;

  return (
    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max flex flex-col items-center
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                    transition-opacity duration-200 pointer-events-none z-20">
      <div className="flex flex-col bg-slate-950/90 border border-slate-700 p-2 rounded-lg shadow-lg backdrop-blur-sm max-w-xs">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {tags.map((tag) => (
            <span key={tag.text} className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getTagClasses(tag.type)}`}>
              {tag.text}
            </span>
          ))}
        </div>

        {/* Live Summary */}
        {liveSummary.length > 0 && (
          <div className="border-t border-slate-700/50 pt-1 mb-1">
            {liveSummary.map((line, idx) => (
              <div key={idx} className="text-[9px] text-slate-200 leading-tight">
                {line}
              </div>
            ))}
          </div>
        )}

        {/* Estado Interno */}
        {(instance?.effectMultiplier || instance?.cooldownUntil || instance?.justiceBonus !== undefined || instance?.hangedManActive || instance?.towerArcanoActive || (instance?.marks && Array.isArray(instance.marks) && instance.marks.length > 0)) && (
          <div className="border-t border-slate-700/50 pt-1 mb-1 space-y-0.5 text-[9px] text-slate-300">
            {instance?.effectMultiplier && instance.effectMultiplier > 1 && (
              <div>🔥 Multiplicador: {instance.effectMultiplier}x</div>
            )}
            
            {instance?.cooldownUntil && typeof globalHours === 'number' && (
              <div>⏱️ Cooldown: {Math.max(0, instance.cooldownUntil - globalHours)}h</div>
            )}
            
            {instance?.justiceBonus !== undefined && typeof globalHours === 'number' && (
              <div>⚖️ Bônus: +{instance.justiceBonus}% (próxima em {(7 - (globalHours % 7)) || 7}h)</div>
            )}
            
            {instance?.hangedManActive && (
              <div>🪢 Sacrifício ativo ({instance.hangedManConsumes || 0} cartas)</div>
            )}
            
            {instance?.towerArcanoActive && (
              <div>💥 Arcano Maior: {instance.towerArcanoCycles} ciclos</div>
            )}
            
            {instance?.marks && Array.isArray(instance.marks) && instance.marks.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {instance.marks.map((m, i) => (
                  <span key={i} className="bg-purple-900/60 px-1 rounded text-[8px]">
                    {m.icon} {m.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sinergias */}
        {Array.isArray(synergiesForThisCard) && synergiesForThisCard.length > 0 && (
          <div className="border-t border-slate-700/50 pt-1">
            <div className="text-[9px] text-indigo-300 mb-1 font-bold">Sinergias:</div>
            <div className="flex gap-1 flex-wrap">
              {synergiesForThisCard.map(s => (
                <span key={s.id} className={`text-[8px] px-1.5 py-0.5 rounded border ${
                  s.isEmpowered
                    ? 'bg-amber-900/80 border-amber-500/60 text-amber-200'
                    : 'bg-indigo-900/80 border-indigo-500/60 text-indigo-200'
                }`}>
                  {s.icon} {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="w-2 h-2 bg-slate-950 border-b border-r border-slate-700 transform rotate-45 -mt-1"/>
    </div>
  );
};

export default CardTooltip;