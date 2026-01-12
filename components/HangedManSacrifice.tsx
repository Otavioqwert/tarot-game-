
import React, { useState } from 'react';
import { CardInstance } from '../types';
import { TAROT_LIBRARY } from '../constants';

interface HangedManSacrificeProps {
  inventory: CardInstance[];
  onConfirm: (sacrificedCards: CardInstance[]) => void;
  onCancel: () => void;
}

const getCardData = (instance?: CardInstance | null) => {
    return instance ? TAROT_LIBRARY.find(c => c.id === instance.cardId) : undefined;
}

const HangedManSacrifice: React.FC<HangedManSacrificeProps> = ({ inventory, onConfirm, onCancel }) => {
  const [availableCards, setAvailableCards] = useState<CardInstance[]>(inventory);
  const [sacrificedCards, setSacrificedCards] = useState<CardInstance[]>([]);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  const n = sacrificedCards.length;
  const payout = ((n + 1) * n / 2) * 50;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: CardInstance) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCardId(card.instanceId);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedCardId) return;

    const cardToMove = availableCards.find(c => c.instanceId === draggedCardId);
    if (cardToMove) {
      setSacrificedCards(prev => [...prev, cardToMove]);
      setAvailableCards(prev => prev.filter(c => c.instanceId !== draggedCardId));
    }
    setDraggedCardId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleConfirm = () => {
    onConfirm(sacrificedCards);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-purple-700/50 rounded-2xl p-6 shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-mystic text-purple-300">Altar do Sacrifício</h2>
          <p className="text-slate-400 text-sm">Arraste os arcanos da sua coleção para o altar. O sacrifício é final.</p>
        </div>
        
        <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
          {/* Inventory Side */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col p-4">
            <h3 className="font-bold text-slate-300 mb-2 text-center text-sm">Sua Coleção ({availableCards.length})</h3>
            <div className="grid grid-cols-5 gap-3 overflow-y-auto pr-2">
              {availableCards.map(instance => {
                const card = getCardData(instance);
                if (!card) return null;
                return (
                  <div
                    key={instance.instanceId}
                    draggable
                    onDragStart={e => handleDragStart(e, instance)}
                    className="aspect-[2/3] bg-slate-900 border border-slate-700 rounded-lg cursor-grab active:cursor-grabbing relative"
                  >
                    <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover rounded-lg" />
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Sacrifice Side */}
          <div className="bg-slate-900/50 border-2 border-dashed border-purple-800 rounded-xl flex flex-col p-4" onDrop={handleDrop} onDragOver={handleDragOver}>
            <h3 className="font-bold text-purple-300 mb-2 text-center text-sm">Cartas a Sacrificar ({n})</h3>
             <div className="grid grid-cols-5 gap-3 overflow-y-auto pr-2 flex-1">
               {sacrificedCards.map(instance => {
                const card = getCardData(instance);
                if (!card) return null;
                return (
                  <div key={instance.instanceId} className="aspect-[2/3] bg-slate-900 border border-purple-600 rounded-lg relative">
                    <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover rounded-lg opacity-50" />
                  </div>
                );
              })}
             </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
          <button onClick={onCancel} className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors">Cancelar</button>
          <div className="text-center">
            <p className="text-xs text-slate-400">Recompensa Pendente</p>
            <p className="text-xl font-bold text-amber-400 flex items-center space-x-2">
              <span>{payout.toFixed(2)}</span>
              <span className="text-amber-500 text-lg">✨</span>
            </p>
          </div>
          <button onClick={handleConfirm} className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed" disabled={n === 0}>
            Confirmar Sacrifício
          </button>
        </div>
      </div>
    </div>
  );
};

export default HangedManSacrifice;