import React from 'react';
import { ActiveSynergy } from '../synergies';

interface SynergyDisplayProps {
  synergies: ActiveSynergy[];
  isDayTime: boolean;
}

const SynergyDisplay: React.FC<SynergyDisplayProps> = ({ synergies, isDayTime }) => {
  if (isDayTime) {
    return (
      <div className="bg-slate-900/40 p-4 rounded-2xl border border-cyan-900/20 h-full flex flex-col">
        <h3 className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-3 text-center">Sinergias Ativas</h3>
        {synergies.length > 0 ? (
          <div className="space-y-2 overflow-y-auto pr-1">
            {synergies.map(s => (
              <div
                key={s.id}
                className="bg-slate-800/50 p-2 rounded-md cursor-help border border-slate-700/50 hover:border-cyan-500/50 transition-colors"
                title={`${s.icon} ${s.name}\n${s.isEmpowered ? s.descriptionEmperor : s.description}\n\nTags: ${s.tags.join(', ')}`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{s.icon}</span>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-200">{s.name}</span>
                    {s.isEmpowered && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-900/80 text-amber-200 border border-amber-500/60 ml-1">Empoderada</span>}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic line-clamp-2">
                  {s.isEmpowered ? s.descriptionEmperor : s.description}
                </p>
                {/* Tags */}
                <div className="mt-1 flex flex-wrap gap-1">
                  {s.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[8px] px-1.5 py-0.5 rounded-full bg-slate-900/60 border border-cyan-500/20 text-cyan-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30">
            <span className="text-2xl mb-1">✨</span>
            <p className="text-[10px] text-slate-500">Nenhuma sinergia detectada.</p>
          </div>
        )}
      </div>
    );
  }

  // Night Time View - Constelações com tooltip
  return (
    <div className="bg-slate-900/40 p-4 rounded-2xl border border-cyan-900/20 h-full flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" style={{
            backgroundImage: 'radial-gradient(circle, #fff 0.5px, transparent 0.5px)',
            backgroundSize: '20px 20px',
            animation: 'stars-pulse 8s infinite ease-in-out'
        }}/>
        <h3 className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-2 text-center z-10">Constelações</h3>
        {synergies.length > 0 ? (
            <>
                <div className="flex-1 relative">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                        {synergies.map((s, i) => (
                             <g key={s.id} className="cursor-help">
                                <title>{`${s.icon} ${s.name}\n${s.isEmpowered ? s.descriptionEmperor : s.description}\n${s.tags.join(' • ')}`}</title>
                                <path 
                                    d={s.constellationPath}
                                    stroke={s.isEmpowered ? '#fbbf24' : '#a5b4fc'}
                                    strokeWidth={s.isEmpowered ? 0.8 : 0.5}
                                    fill="none"
                                    className="synergy-constellation"
                                    style={{ animationDelay: `${i * 0.5}s` }}
                                />
                            </g>
                        ))}
                    </svg>
                </div>
                {/* Legenda compacta abaixo das constelações */}
                <div className="mt-2 pt-2 border-t border-slate-700/50 space-y-1 z-10 max-h-24 overflow-y-auto">
                  {synergies.map(s => (
                    <div key={s.id} className="flex items-start gap-1 text-[9px]">
                      <span className="text-lg flex-shrink-0">{s.icon}</span>
                      <div className="flex-1">
                        <span className="font-bold text-cyan-300">{s.name}</span>
                        {s.isEmpowered && <span className="text-[8px] text-amber-300 ml-1">(Empoderada)</span>}
                        <div className="text-slate-400 text-[8px] leading-tight mt-0.5">
                          {s.tags.join(' • ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </>
        ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 z-10">
                <span className="text-2xl mb-1">🔭</span>
                <p className="text-[10px] text-slate-500">Céu limpo...</p>
            </div>
        )}
    </div>
  );
};

export default SynergyDisplay;