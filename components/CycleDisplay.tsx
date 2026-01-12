
import React from 'react';
import { CycleState } from '../types';
import { LUNAR_PHASES, ZODIAC_SIGNS } from '../constants';

interface CycleDisplayProps {
  cycle: CycleState;
  currentSignIndex: number;
  isDayTime: boolean;
}

const CycleDisplay: React.FC<CycleDisplayProps> = ({ cycle, currentSignIndex, isDayTime }) => {
  const dailyProgress = (cycle.daily / 24) * 100;
  
  const phaseIndex = Math.floor(cycle.lunar / 42) % 4;
  const currentPhase = LUNAR_PHASES[phaseIndex];
  
  const signProgress = (cycle.sign / 672) * 100;

  return (
    <div className="w-full flex flex-col space-y-4">
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-indigo-900/20 flex flex-col items-center">
        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Horário Astral</span>
        <div className="flex items-center space-x-2">
          {isDayTime ? (
            <span className="text-xl text-amber-300 sun-icon-animation">☀️</span>
          ) : (
            <span className="text-xl">🌙</span>
          )}
          <span className="text-2xl font-mystic text-slate-100">{cycle.daily.toString().padStart(2, '0')}:00h</span>
        </div>
        <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-[30000ms] ease-linear"
            style={{ width: `${dailyProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-purple-900/20 flex flex-col items-center">
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-1">Fase Lunar</span>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{currentPhase.icon}</span>
            <span className="text-lg font-mystic text-slate-100">{currentPhase.name}</span>
          </div>
          <span className="text-[9px] text-slate-500 mt-2 uppercase">Dia {(Math.floor(cycle.lunar / 24) % 7) + 1} de 7</span>
        </div>

        <div className="bg-slate-900/40 p-4 rounded-2xl border border-amber-900/20 flex flex-col items-center">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-1">Zodíaco</span>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{ZODIAC_SIGNS[currentSignIndex].icon}</span>
            <span className="text-lg font-mystic text-slate-100">{ZODIAC_SIGNS[currentSignIndex].name}</span>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-[1000ms] ease-out"
              style={{ width: `${signProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleDisplay;