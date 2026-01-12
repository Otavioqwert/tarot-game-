
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
              <div key={s.id} className="bg-slate-800/50 p-2 rounded-md">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{s.icon}</span>
                  <span className="text-xs font-bold text-slate-200">{s.name}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic">
                  {s.isEmpowered ? s.descriptionEmperor : s.description}
                </p>
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

  // Night Time View
  return (
    <div className="bg-slate-900/40 p-4 rounded-2xl border border-cyan-900/20 h-full flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" style={{
            backgroundImage: 'radial-gradient(circle, #fff 0.5px, transparent 0.5px)',
            backgroundSize: '20px 20px',
            animation: 'stars-pulse 8s infinite ease-in-out'
        }}/>
        <h3 className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-2 text-center z-10">Constelações</h3>
        {synergies.length > 0 ? (
            <div className="flex-1 relative">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                    {synergies.map((s, i) => (
                         <path 
                            key={s.id}
                            d={s.constellationPath}
                            stroke="#a5b4fc"
                            strokeWidth="0.5"
                            fill="none"
                            className="synergy-constellation"
                            style={{ animationDelay: `${i * 0.5}s` }}
                         />
                    ))}
                </svg>
            </div>
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
