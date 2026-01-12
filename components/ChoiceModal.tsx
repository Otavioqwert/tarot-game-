import React from 'react';
import { Card } from '../types';
import CardTooltip from './CardTooltip';

interface ChoiceModalProps {
  cards: Card[];
  onSelect: (card: Card) => void;
}

const ChoiceModal: React.FC<ChoiceModalProps> = ({ cards, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-indigo-700/50 rounded-2xl p-8 shadow-2xl max-w-4xl w-full text-center">
        <h2 className="text-2xl font-mystic text-amber-300 mb-2">A Escolha dos Enamorados</h2>
        <p className="text-slate-400 mb-8">Selecione um arcano para adicionar à sua coleção.</p>
        
        <div className={`flex justify-center gap-4 flex-wrap`}>
          {cards.map(card => (
            <div 
              key={card.id} 
              onClick={() => onSelect(card)}
              className="w-40 aspect-[2/3] bg-slate-900 border-2 border-slate-700 rounded-xl flex flex-col items-center justify-end cursor-pointer transition-all hover:scale-105 hover:border-amber-400 group relative overflow-hidden p-2 text-center"
            >
              <CardTooltip card={card} />
              <img src={card.imageUrl} alt={card.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
              <h3 className="relative text-sm font-mystic text-white z-10">{card.name}</h3>
              <p className="relative text-[9px] text-slate-400 z-10 line-clamp-2 italic">{card.effect}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChoiceModal;