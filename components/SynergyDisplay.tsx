import React from 'react';
import { ActiveSynergy } from '../synergies';

interface SynergyDisplayProps {
  synergies: ActiveSynergy[];
  isDayTime: boolean;
}

const SynergyDisplay: React.FC<SynergyDisplayProps> = ({ synergies, isDayTime }) => {
  return (
    <div className="w-full bg-slate-900/50 border border-slate-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mystic text-indigo-300 uppercase tracking-wider flex items-center gap-2">
          <span className="text-lg">✨</span>
          Sinergias Ativas
        </h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          isDayTime ? 'bg-amber-900/60 text-amber-200 border border-amber-500/30' : 'bg-indigo-900/60 text-indigo-200 border border-indigo-500/30'
        }`}>
          {isDayTime ? '☀️ Dia' : '🌙 Noite'}
        </span>
      </div>

      {synergies.length === 0 ? (
        <div className="text-[9px] text-slate-500 italic text-center py-4">
          Nenhuma sinergia ativa. Coloque cartas relacionadas para ativar efeitos especiais.
        </div>
      ) : (
        <div className="space-y-2">
          {synergies.map(synergy => (
            <div
              key={synergy.id}
              className={`relative group p-2 rounded-lg border transition-all ${
                synergy.isEmpowered
                  ? 'bg-amber-900/40 border-amber-500/50'
                  : 'bg-indigo-900/20 border-indigo-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-lg">{synergy.icon}</span>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-100 leading-tight">
                      {synergy.name}
                    </div>
                    <div className="text-[9px] text-slate-400 leading-tight opacity-75 max-h-6 overflow-hidden">
                      {synergy.description}
                    </div>
                  </div>
                </div>
                {synergy.isEmpowered && (
                  <span className="text-lg animate-pulse" title="Sinergia Empoderada">⚡</span>
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-0 right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 pointer-events-none">
                <div className="bg-slate-950/95 border border-slate-700 rounded-lg p-2 text-[8px] text-slate-200 backdrop-blur-sm">
                  <div className="mb-1 text-indigo-300 font-bold">{synergy.name}</div>
                  <div className="mb-1">{synergy.description}</div>
                  <div className="text-slate-500 text-[7px]">
                    Cartas: {synergy.cards.join(', ')}
                  </div>
                  {synergy.isEmpowered && (
                    <div className="mt-1 pt-1 border-t border-slate-700/50 text-amber-300">
                      ⚡ Empoderada: {synergy.empowerment}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SynergyDisplay;