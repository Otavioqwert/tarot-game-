import React from 'react';
import { ShopItem } from '../types';
import CardTooltip from './CardTooltip';

interface ShopProps {
  items: ShopItem[];
  onBuy: (item: ShopItem) => void;
  isRestocking: boolean;
}

const Shop: React.FC<ShopProps> = ({ items, onBuy, isRestocking }) => {
  return (
    <div className="bg-[#0f172a]/60 border border-slate-800/50 rounded-2xl p-4 h-full flex flex-col relative overflow-hidden">
      {isRestocking && (
        <div className="absolute inset-0 bg-[#0f172a]/90 flex flex-col items-center justify-center z-20 backdrop-blur-sm">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-2 border-purple-500/50 rounded-full vortex-spin opacity-50" />
            <div className="absolute inset-2 border-t-2 border-cyan-400 rounded-full vortex-spin" style={{ animationDuration: '2s' }} />
            <div className="absolute inset-4 border-b-2 border-amber-400 rounded-full vortex-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
          </div>
          <p className="mt-6 text-xs text-slate-400 italic">Alinhando os fios do destino...</p>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-mystic text-indigo-400 tracking-widest uppercase">Ofertas Celestiais</h3>
      </div>
      
      <div className={`space-y-3 overflow-y-auto pr-1 flex-1 ${isRestocking ? 'dissolve-out' : ''}`}>
        {items.map((item) => (
          <div 
            key={item.id} 
            className={`bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between group hover:border-indigo-500/50 transition-colors relative ${!isRestocking ? 'materialize-in' : ''}`}
            style={{ animationDelay: `${3.5 + Math.random() * 0.3}s` }}
          >
            {item.cardData && <CardTooltip card={item.cardData} />}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-xl relative overflow-hidden">
                {item.cardData ? (
                  <img src={item.cardData.imageUrl} alt={item.cardData.name} className="w-full h-full object-cover object-center" />
                ) : '✨'}
                {item.cardData?.marks?.[0] && (
                  <span className="absolute top-0 right-0 text-xs bg-black/50 px-1 rounded-bl-md">{item.cardData.marks[0].icon}</span>
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-tight">{item.name}</h4>
                <p className="text-[10px] text-slate-500 line-clamp-1 italic">{item.description}</p>
              </div>
            </div>
            
            <button 
              onClick={() => onBuy(item)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-all shadow-lg active:scale-95 flex items-center space-x-1 disabled:bg-slate-700 disabled:cursor-not-allowed"
              disabled={item.cost === 0}
            >
              <span>{item.cost > 0 ? item.cost : 'Grátis'}</span>
              {item.cost > 0 && <span className="text-xs opacity-70">✨</span>}
            </button>
          </div>
        ))}

        {items.length === 0 && !isRestocking && (
          <div className="flex flex-col items-center justify-center h-48 opacity-20 italic space-y-2">
             <span className="text-2xl">⏳</span>
             <p className="text-xs">Aguardando reposição de estoque...</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-800 text-center">
        <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest">Reposiciona a cada ciclo de 24h</p>
      </div>
    </div>
  );
};

export default Shop;