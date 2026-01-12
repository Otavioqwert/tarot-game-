import React from 'react';
import { CardInstance } from '../types';
import { TAROT_LIBRARY } from '../constants';
import CardTooltip from './CardTooltip';

interface InventoryProps {
  cards: CardInstance[];
  onCardClick: (index: number) => void;
  selectedIndex: number | null;
}

const getCardData = (instance?: CardInstance | null) => {
    return instance ? TAROT_LIBRARY.find(c => c.id === instance.cardId) : undefined;
}

const Inventory: React.FC<InventoryProps> = ({ cards, onCardClick, selectedIndex }) => {

  const getInstructionText = () => {
    if (selectedIndex === null) return 'Clique em uma carta para selecionar.';
    return 'Selecione um espaço no Círculo para alinhar.';
  };

  return (
    <div className="bg-[#0f172a]/60 border border-slate-800/50 rounded-2xl p-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-mystic text-indigo-400 tracking-widest uppercase">Coleção de Arcanos</h3>
        {selectedIndex !== null && (
          <button onClick={() => onCardClick(selectedIndex)} className="text-[9px] uppercase font-bold text-slate-500 hover:text-white">Cancelar</button>
        )}
      </div>
      
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-1 flex-1">
        {cards.map((instance, idx) => {
          const card = getCardData(instance);
          if (!card) return null;

          return (
            <div 
              key={instance.instanceId}
              onClick={() => onCardClick(idx)}
              className={`aspect-[2/3] bg-slate-900 border rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 group relative overflow-hidden
                ${selectedIndex === idx ? 'border-amber-400 shadow-[0_0_15px_rgba(250,179,8,0.5)] scale-105' : 'border-slate-800 hover:border-indigo-500'}
              `}
            >
              <CardTooltip card={card} />
              <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />

              <div className="absolute top-1 left-1 flex space-x-0.5 text-[10px] bg-slate-950/50 px-1 rounded-full z-10">
                {instance.marks?.map((mark, i) => <span key={i}>{mark.icon}</span>)}
              </div>
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${card.element === 'fire' ? 'bg-orange-500' : card.element === 'water' ? 'bg-blue-500' : card.element === 'earth' ? 'bg-green-600' : card.element === 'air' ? 'bg-cyan-400' : 'bg-purple-500'}`} />
            </div>
          )
        })}
        {cards.length === 0 && <div className="col-span-full flex flex-col items-center justify-center py-12 opacity-20 border border-dashed border-slate-800 rounded-xl"><span className="text-3xl mb-2">👝</span><p className="text-[10px] uppercase font-bold tracking-tighter">Bolsa Vazia</p></div>}
      </div>
      
      <p className="mt-4 text-[9px] text-slate-500 text-center italic h-4">
        {getInstructionText()}
      </p>
    </div>
  );
};

export default Inventory;