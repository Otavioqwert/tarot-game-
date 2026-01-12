import React, { useState } from 'react';
import { CardInstance } from '../types';
import { TAROT_LIBRARY } from '../constants';

interface TheDevilModalProps {
  inventory: CardInstance[];
  onConfirm: (selected: { cardInstanceId: string; markIndex: number }[]) => void;
  onCancel: () => void;
}

const getCardData = (instance?: CardInstance | null) => {
  return instance ? TAROT_LIBRARY.find(c => c.id === instance.cardId) : undefined;
};

const CURSE_TYPES = [
  {
    type: 'ISOLATED',
    name: 'Isolada',
    description: 'Sem bônus adjacentes, +50% produção própria',
    icon: '🔗',
    color: 'bg-red-900/50 border-red-700',
  },
  {
    type: 'VOLATILE',
    name: 'Volátil',
    description: 'Alterna entre efeitos: +200%, +0.2 sync/ciclo, ou -0.2 ciclos',
    icon: '⚡',
    color: 'bg-yellow-900/50 border-yellow-700',
  },
  {
    type: 'TEMPORAL',
    name: 'Temporal',
    description: 'Apenas luas ímpares/pares, efeito x3 quando ativa',
    icon: '🌙',
    color: 'bg-purple-900/50 border-purple-700',
  },
];

const TheDevilModal: React.FC<TheDevilModalProps> = ({ inventory, onConfirm, onCancel }) => {
  const [selectedMarks, setSelectedMarks] = useState<{ cardInstanceId: string; markIndex: number }[]>([]);
  const [previewRewards, setPreviewRewards] = useState<string[]>([]);

  // Filter cards that have marks
  const cardsWithMarks = inventory.filter(card => (card.marks || []).length > 0);

  const handleMarkSelect = (cardInstanceId: string, markIndex: number) => {
    const isSelected = selectedMarks.some(
      m => m.cardInstanceId === cardInstanceId && m.markIndex === markIndex
    );

    if (isSelected) {
      setSelectedMarks(prev =>
        prev.filter(m => !(m.cardInstanceId === cardInstanceId && m.markIndex === markIndex))
      );
    } else {
      if (selectedMarks.length < 2) {
        setSelectedMarks(prev => [...prev, { cardInstanceId, markIndex }]);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedMarks.length > 0) {
      // Generate preview rewards
      const rewards: string[] = [];
      for (let i = 0; i < selectedMarks.length; i++) {
        const roll = Math.random();
        if (roll < 0.33) {
          rewards.push('+250 Recursos 💰');
        } else if (roll < 0.66) {
          rewards.push('+5 Sync Permanente ⚡');
        } else {
          rewards.push('+1 Multiplicador 📈');
        }

        // 50% chance de recompensa extra
        if (Math.random() < 0.5) {
          const roll2 = Math.random();
          if (roll2 < 0.33) {
            rewards.push('+250 Recursos 💰');
          } else if (roll2 < 0.66) {
            rewards.push('+5 Sync Permanente ⚡');
          } else {
            rewards.push('+1 Multiplicador 📈');
          }
        }
      }
      setPreviewRewards(rewards);
      onConfirm(selectedMarks);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-red-700/50 rounded-2xl p-6 shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6 sticky top-0 bg-[#0f172a] pb-4 border-b border-red-900/30">
          <h2 className="text-3xl font-mystic text-red-400 mb-1">😈 O Diabo 😈</h2>
          <p className="text-slate-400 text-sm mb-2">Selecione ATÉ 2 marcas para consumir. Ganhe recompensas aleatórias e maldições.</p>
          <p className="text-xs text-red-500/70">⚠️ Esta ação é irreversível!</p>
        </div>

        {/* Cards with Marks */}
        {cardsWithMarks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">Nenhuma carta com marcas disponível para sacrificar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mb-6">
            {cardsWithMarks.map(instance => {
              const card = getCardData(instance);
              if (!card) return null;

              return (
                <div
                  key={instance.instanceId}
                  className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 hover:bg-slate-900/70 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* Card Info */}
                    <div className="flex-shrink-0 w-20 h-24 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Marks */}
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-sm mb-2">{card.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {instance.marks?.map((mark, idx) => {
                          const isSelected = selectedMarks.some(
                            m => m.cardInstanceId === instance.instanceId && m.markIndex === idx
                          );
                          return (
                            <button
                              key={idx}
                              onClick={() => handleMarkSelect(instance.instanceId, idx)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                isSelected
                                  ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.6)] scale-110'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {mark.icon} {mark.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Selection Count */}
                    <div className="text-center">
                      <p className="text-xs text-slate-400">Selecionadas</p>
                      <p className="text-lg font-bold text-red-400">
                        {selectedMarks.filter(m => m.cardInstanceId === instance.instanceId).length}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Curse Preview */}
        {selectedMarks.length > 0 && (
          <div className="mb-6 bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h3 className="text-slate-300 font-bold text-sm mb-3">Maldições Aplicadas:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedMarks.map((mark, idx) => (
                <div key={idx} className="text-xs">
                  <p className="text-slate-400 mb-1">Marca {idx + 1}:</p>
                  {CURSE_TYPES.map(curse => (
                    <div key={curse.type} className={`${curse.color} border rounded px-2 py-1 mb-1`}>
                      <p className="font-bold text-slate-200">{curse.icon} {curse.name}</p>
                      <p className="text-slate-300 text-[10px]">{curse.description}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rewards Preview */}
        {previewRewards.length > 0 && (
          <div className="mb-6 bg-green-900/20 border border-green-700 rounded-lg p-4">
            <h3 className="text-green-300 font-bold text-sm mb-2">🎁 Recompensas Geradas:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {previewRewards.map((reward, idx) => (
                <div
                  key={idx}
                  className="bg-green-900/30 border border-green-600 rounded px-3 py-2 text-sm text-green-200 font-bold text-center animate-pulse"
                >
                  {reward}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-4">
          <button
            onClick={onCancel}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-2 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <div className="text-sm text-slate-400">
            {selectedMarks.length} / 2 marcas selecionadas
          </div>
          <button
            onClick={handleConfirm}
            disabled={selectedMarks.length === 0}
            className="bg-red-600 hover:bg-red-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-lg transition-colors"
          >
            Confirmar Sacrifício
          </button>
        </div>
      </div>
    </div>
  );
};

export default TheDevilModal;