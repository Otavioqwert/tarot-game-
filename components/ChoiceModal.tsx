import React, { useState } from 'react';
import { Card } from '../types';
import CardTooltip from './CardTooltip';

interface ChoiceModalProps {
  cards: Card[];
  onSelect: (card: Card) => void;
}

const ChoiceModal: React.FC<ChoiceModalProps> = ({ cards, onSelect }) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const handleConfirm = () => {
    if (selectedCard) {
      onSelect(selectedCard);
      setSelectedCard(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-rose-700/50 rounded-2xl p-8 shadow-2xl max-w-5xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-mystic text-rose-300 mb-1">💕 A Escolha dos Enamorados 💕</h2>
          <p className="text-slate-400 text-sm">Selecione um dos arcanos para adicionar à sua coleção. Os espaços em branco herdarão suas marcas.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {cards.map(card => (
            <div 
              key={card.id} 
              onClick={() => setSelectedCard(card)}
              className={`w-full aspect-[2/3] bg-slate-900 border-2 rounded-lg flex flex-col items-center justify-end cursor-pointer transition-all duration-200 group relative overflow-hidden p-2 text-center ${
                selectedCard?.id === card.id 
                  ? 'border-rose-400 scale-105 shadow-[0_0_20px_rgba(251,113,133,0.5)]'
                  : 'border-slate-700 hover:scale-105 hover:border-rose-400'
              }`}
            >
              <CardTooltip card={card} />
              <img 
                src={card.imageUrl} 
                alt={card.name} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
              <h3 className="relative text-sm font-mystic text-white z-10 font-bold">{card.name}</h3>
              <p className="relative text-[8px] text-slate-300 z-10 line-clamp-1 italic">{card.effect}</p>
              {selectedCard?.id === card.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-rose-400 rounded-full flex items-center justify-center text-white text-xs font-bold z-20 shadow-lg">✓</div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="flex-1">
            {selectedCard && (
              <p className="text-rose-300 text-sm font-bold">✨ {selectedCard.name} foi selecionado!</p>
            )}
          </div>
          <button 
            onClick={handleConfirm}
            disabled={!selectedCard}
            className="bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-lg transition-colors"
          >
            Confirmar Escolha
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChoiceModal;