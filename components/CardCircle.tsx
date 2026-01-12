import React, { useMemo } from 'react';
import { CircleSlot, CardInstance } from '../types';
import { TAROT_LIBRARY, BLANK_CARD_DATA, LUNAR_MAX } from '../constants';
import { cardHandlers } from '../effects';
import CardTooltip from './CardTooltip';

interface CardCircleProps {
  slots: CircleSlot[];
  onRemove: (index: number) => void;
  onPlace: (index: number) => void;
  onActivate: (index: number) => void;
  selectedCardIndex: number | null;
  globalHours: number;
}

interface Interaction {
  from: number;
  to: number;
  color: string;
}

const getCardData = (instance?: CardInstance | null) => {
    if (!instance) return undefined;
    if (instance.isBlank) return BLANK_CARD_DATA;
    return TAROT_LIBRARY.find(c => c.id === instance.cardId);
}

const CardCircle: React.FC<CardCircleProps> = ({ slots, onRemove, onPlace, onActivate, selectedCardIndex, globalHours }) => {
  const R = slots.length === 4 ? 140 : 130;
  const cardScale = slots.length === 4 ? 'scale(0.95)' : 'scale(1)';

  const getPos = (angleDeg: number) => ({ x: R * Math.cos((angleDeg * Math.PI) / 180), y: R * Math.sin((angleDeg * Math.PI) / 180) });
  
  const positions = useMemo(() => {
    if (slots.length === 4) {
      return [ getPos(-90), getPos(0), getPos(90), getPos(180) ];
    }
    return [ getPos(-90), getPos(30), getPos(150) ];
  }, [slots.length, R]);

  const interactions = useMemo<Interaction[]>(() => {
    const activeInteractions: Interaction[] = [];
    slots.forEach((slot, i) => {
      const cardData = getCardData(slot.card);
      if (!cardData || !cardData.effectId) return;

      const rightIdx = (i + 1) % slots.length;
      const leftIdx = (i + slots.length - 1) % slots.length;

      switch (cardData.effectId) {
        case 'THE_MAGICIAN':
          if (slots[rightIdx].card) activeInteractions.push({ from: i, to: rightIdx, color: '#f59e0b' });
          break;
        case 'STRENGTH':
          if (slots[rightIdx].card) activeInteractions.push({ from: i, to: rightIdx, color: '#ef4444' });
          if (slots[leftIdx].card) activeInteractions.push({ from: i, to: leftIdx, color: '#ef4444' });
          break;
        case 'JUDGEMENT':
          if (slots[rightIdx].card) activeInteractions.push({ from: i, to: rightIdx, color: '#60a5fa' });
          if (slots[leftIdx].card) activeInteractions.push({ from: i, to: leftIdx, color: '#60a5fa' });
          break;
        case 'DEATH':
          if (slots[leftIdx].card) activeInteractions.push({ from: i, to: leftIdx, color: '#a855f7' });
          break;
      }
    });
    return activeInteractions;
  }, [slots]);

  return (
    <div className="relative w-[360px] h-[360px] flex items-center justify-center">
      <svg className="absolute w-full h-full pointer-events-none overflow-visible" viewBox="-180 -180 360 360">
        <circle r={R} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="5 5" />
        {positions.map((pos, i) => {
            const nextPos = positions[(i + 1) % positions.length];
            return <path key={i} d={`M ${pos.x} ${pos.y} L ${nextPos.x} ${nextPos.y}`} stroke="#1e293b" strokeWidth="1" />
        })}
        
        {interactions.map((link, idx) => (
          <line
            key={idx}
            x1={positions[link.from].x} y1={positions[link.from].y}
            x2={positions[link.to].x} y2={positions[link.to].y}
            stroke={link.color}
            className="interaction-line"
          />
        ))}
      </svg>

      {slots.map((slot, i) => {
        const cardData = getCardData(slot.card);
        const isPlacing = selectedCardIndex !== null && (!slot.card || slot.card.isBlank);
        const isActivatable = cardData?.effectId && cardHandlers[cardData.effectId]?.onActivate;
        const isOnCooldown = slot.card?.cooldownUntil && slot.card.cooldownUntil > globalHours;

        let passiveCooldownProgress: { progress: number, color: string } | null = null;
        if (cardData?.effectId) {
            switch (cardData.effectId) {
                case 'JUSTICE':
                    passiveCooldownProgress = { progress: (globalHours % 7) / 7, color: '#60a5fa' };
                    break;
                case 'THE_TOWER':
                    passiveCooldownProgress = { progress: (globalHours % 8) / 8, color: '#f43f5e' };
                    break;
                case 'DEATH':
                    passiveCooldownProgress = { progress: (globalHours % LUNAR_MAX) / LUNAR_MAX, color: '#a855f7' };
                    break;
            }
        }

        const arcRadius = 46;
        const circumference = 2 * Math.PI * arcRadius;

        return (
          <div 
            key={i}
            style={{ 
                transform: `translate(${positions[i].x}px, ${positions[i].y}px) ${cardScale}`,
                transition: 'transform 0.5s ease-in-out',
            }}
            onClick={() => {
              if (slot.card && !slot.card.isBlank && !isActivatable) onRemove(i);
              if (isPlacing) onPlace(i);
            }}
            className="absolute w-20 h-32 rounded-lg flex items-center justify-center group z-10"
          >
            {cardData && <CardTooltip card={cardData} />}

            {passiveCooldownProgress && (
              <svg className="absolute w-[100px] h-[100px] pointer-events-none" viewBox="-50 -50 100 100">
                  <circle r={arcRadius} stroke="#1e293b" fill="none" strokeWidth="2" />
                  <path
                      d={`M 0,-${arcRadius} A ${arcRadius},${arcRadius} 0 1 1 -0.01,-${arcRadius}`}
                      stroke={passiveCooldownProgress.color}
                      className="cooldown-arc"
                      style={{
                          strokeDasharray: circumference,
                          strokeDashoffset: circumference * (1 - passiveCooldownProgress.progress)
                      }}
                  />
              </svg>
            )}

            <div 
              className={`w-full h-full rounded-lg border transition-all duration-300 flex flex-col items-center justify-center overflow-hidden
                ${slot.card ? 'bg-[#0f172a] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-slate-900/20 border-slate-800 border-dashed'}
                ${isPlacing ? 'border-amber-400 border-solid scale-105 shadow-[0_0_20px_rgba(250,179,8,0.4)] cursor-pointer' : 'hover:border-slate-600'}
                ${!isActivatable && slot.card && !slot.card.isBlank ? 'hover:scale-105 cursor-pointer' : ''}
              `}
            >
              {slot.card && cardData ? (
                <>
                  <div className="absolute top-1 left-1 flex space-x-1 text-xs z-10 p-0.5">
                    {slot.card.marks?.map((mark, idx) => (
                      <div key={idx} className="bg-purple-900/70 w-4 h-4 flex items-center justify-center rounded-sm backdrop-blur-sm border border-purple-500/30">
                          <span className="text-white text-[9px] select-none">{mark.icon}</span>
                      </div>
                    ))}
                  </div>
                  {cardData.imageUrl !== 'about:blank' ? (
                    <img src={cardData.imageUrl} alt={cardData.name} className="w-full h-full object-cover absolute top-0 left-0" />
                  ) : (
                    <div className="w-full h-full bg-slate-950 flex items-center justify-center"><span className="text-3xl opacity-20">?</span></div>
                  )}
                  <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-black/80 to-transparent p-1 flex flex-col justify-end items-center">
                    {isActivatable && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onActivate(i); }}
                        disabled={isOnCooldown}
                        className="text-[9px] bg-amber-500/80 text-black font-bold px-2 py-0.5 rounded-full mb-1 hover:bg-amber-400 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
                      >
                        {isOnCooldown ? `CD: ${slot.card.cooldownUntil! - globalHours}h` : 'Ativar'}
                      </button>
                    )}
                    <span className="text-[9px] font-mystic text-indigo-100 text-center w-full leading-tight uppercase tracking-tighter">{cardData.name}</span>
                  </div>
                  <div className="absolute bottom-0 w-full px-1">
                    <div className="h-0.5 w-full bg-slate-800/50 rounded-full">
                      <div className="h-full bg-indigo-400" style={{ width: `${slot.syncPercentage}%` }} />
                    </div>
                  </div>
                </>
              ) : (
                <div className={`flex flex-col items-center transition-opacity ${isPlacing ? 'opacity-80' : 'opacity-20'}`}>
                  <span className={`text-xl mb-1 ${isPlacing ? 'text-amber-400' : ''}`}>+</span>
                  <span className={`text-[8px] font-mystic uppercase ${isPlacing ? 'text-amber-400' : ''}`}>Alinhar</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  );
};

export default CardCircle;