import React, { useRef, useState } from 'react';
import { Card } from '../types';
import Tooltip from './Tooltip';
import { useAccessibleModal } from '../hooks/useAccessibleModal';

interface ChoiceModalProps {
  cards: Card[];
  onSelect: (card: Card) => void;
}

const ChoiceModal: React.FC<ChoiceModalProps> = ({ cards, onSelect }) => {
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Use accessible modal hook for focus management
  useAccessibleModal(true, () => {}, confirmButtonRef);

  const handleCardSelect = (card: Card) => {
    setSelectedCardId(card.id);
  };

  const handleConfirm = () => {
    const selectedCard = cards.find(c => c.id === selectedCardId);
    if (selectedCard) {
      onSelect(selectedCard);
      setSelectedCardId(null);
    }
  };

  const isConfirmDisabled = selectedCardId === null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="choice-modal-title"
        aria-describedby="choice-modal-description"
        className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-rose-600 rounded-xl shadow-2xl max-w-2xl w-full mx-4"
      >
        {/* Header */}
        <div className="p-6 border-b border-rose-600/40 bg-slate-800/80">
          <h2
            id="choice-modal-title"
            className="text-3xl font-mystic text-rose-300 mb-2 text-center tracking-wider"
          >
            💕 A Escolha do Enamorado
          </h2>
          <p
            id="choice-modal-description"
            className="text-sm text-slate-200 text-center leading-relaxed"
          >
            Selecione uma carta para adicionar à sua coleção.
            <br />
            <span className="text-xs text-slate-300">Use Tab ou Setas para navegar • Enter para confirmar • Escape para sair</span>
          </p>
        </div>

        {/* Card Selection Grid */}
        <div className="p-6 bg-slate-900/50">
          <div
            role="group"
            aria-label="Opções de cartas disponíveis"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
          >
            {cards.map((card, index) => {
              const isSelected = card.id === selectedCardId;
              const cardTooltip = `${card.name}\n${card.effect || 'Sem descrição'}${card.marks && card.marks.length > 0 ? `\nMarcas: ${card.marks.length}` : ''}`;

              return (
                <Tooltip
                  key={card.id}
                  id={`card-tooltip-${card.id}`}
                  text={cardTooltip}
                  direction="top"
                >
                  <button
                    onClick={() => handleCardSelect(card)}
                    onKeyDown={(e) => {
                      // Allow arrow keys to navigate
                      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        const nextIndex = (index + 1) % cards.length;
                        handleCardSelect(cards[nextIndex]);
                      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prevIndex = (index - 1 + cards.length) % cards.length;
                        handleCardSelect(cards[prevIndex]);
                      } else if (e.key === 'Enter' && isSelected) {
                        e.preventDefault();
                        handleConfirm();
                      }
                    }}
                    aria-pressed={isSelected}
                    aria-label={`${card.name}. ${card.effect || 'Sem efeito descrito'}. Selecione para confirmar.`}
                    className={`
                      group relative p-4 rounded-lg border-2 transition-all duration-200
                      ${isSelected
                        ? 'border-rose-400 bg-rose-600/20 ring-2 ring-rose-400 shadow-[0_0_20px_rgba(251,113,133,0.5)]'
                        : 'border-rose-600/60 bg-slate-700 hover:border-rose-400 hover:bg-slate-650 hover:shadow-[0_0_10px_rgba(251,113,133,0.3)]'
                      }
                      focus:outline-2 focus:outline-offset-2 focus:outline-rose-400
                      min-h-[150px] flex flex-col justify-between cursor-pointer
                    `}
                  >
                    {/* Checkmark indicator */}
                    {isSelected && (
                      <div
                        className="absolute top-2 right-2 w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center animate-pulse shadow-lg"
                        aria-hidden="true"
                      >
                        <span className="text-white text-sm font-bold">✓</span>
                      </div>
                    )}

                    {/* Card content */}
                    <div className="flex-1">
                      <div className={`text-lg font-bold mb-2 transition-colors ${
                        isSelected ? 'text-rose-200' : 'text-rose-300 group-hover:text-rose-200'
                      }`}>
                        {card.name}
                      </div>
                      <p className={`text-sm leading-relaxed transition-colors line-clamp-3 ${
                        isSelected ? 'text-slate-100' : 'text-slate-300 group-hover:text-slate-200'
                      }`}>
                        {card.effect || 'Sem descrição'}
                      </p>
                    </div>

                    {/* Mark count indicator */}
                    {card.marks && card.marks.length > 0 && (
                      <div
                        className="mt-3 text-xs font-semibold text-rose-100 bg-rose-600/40 px-3 py-1 rounded-md w-fit border border-rose-500/50"
                        aria-label={`${card.marks.length} marca${card.marks.length !== 1 ? 's' : ''} hereditária${card.marks.length !== 1 ? 's' : ''}`}
                      >
                        ✨ {card.marks.length} marca{card.marks.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </button>
                </Tooltip>
              );
            })}
          </div>

          {/* Selection feedback for screen readers */}
          {selectedCardId !== null && (
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {cards.find(c => c.id === selectedCardId)?.name} selecionada. Pressione Enter ou clique em Confirmar para adicionar.
            </div>
          )}
        </div>

        {/* Footer with buttons */}
        <div className="p-4 bg-slate-800/80 border-t border-rose-600/40 flex gap-3 justify-end">
          <Tooltip
            id="choice-cancel-tooltip"
            text="Cancelar seleção (Escape)"
            direction="top"
          >
            <button
              onClick={() => onSelect(cards[Math.floor(Math.random() * cards.length)])}
              aria-label="Cancelar a seleção e fechar o diálogo"
              className="
                px-4 py-2 rounded-lg font-medium text-slate-100
                border border-slate-500 bg-slate-700 hover:border-slate-400 hover:bg-slate-600
                transition-all duration-200 focus:outline-2 focus:outline-offset-2 focus:outline-slate-300
              "
            >
              Cancelar
            </button>
          </Tooltip>

          <Tooltip
            id="choice-confirm-tooltip"
            text={isConfirmDisabled ? 'Selecione uma carta primeiro' : 'Adicionar à coleção (Enter)'}
            direction="top"
          >
            <button
              ref={confirmButtonRef}
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
              aria-label={isConfirmDisabled ? 'Confirmar - desabilitado até selecionar uma carta' : 'Confirmar seleção'}
              className={`
                px-6 py-2 rounded-lg font-bold transition-all duration-200
                focus:outline-2 focus:outline-offset-2
                ${isConfirmDisabled
                  ? 'bg-rose-600/40 text-rose-100/70 border border-rose-600/60 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 border border-rose-400 focus:outline-rose-300 shadow-lg hover:shadow-rose-500/30'
                }
              `}
            >
              Confirmar Escolha
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ChoiceModal;
