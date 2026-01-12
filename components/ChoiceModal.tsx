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
        className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-rose-700/50 rounded-xl shadow-2xl max-w-2xl w-full mx-4"
      >
        {/* Header */}
        <div className="p-6 border-b border-rose-700/20">
          <h2
            id="choice-modal-title"
            className="text-2xl font-mystic text-rose-300 mb-2 text-center tracking-wider"
          >
            💕 A Escolha do Enamorado
          </h2>
          <p
            id="choice-modal-description"
            className="text-sm text-slate-400 text-center"
          >
            Selecione uma carta para adicionar à sua coleção. Use as setas ou Tab para navegar. Pressione Escape para sair.
          </p>
        </div>

        {/* Card Selection Grid */}
        <div className="p-6">
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
                        ? 'border-rose-500 bg-rose-500/10 ring-2 ring-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                        : 'border-slate-700/50 bg-slate-800/30 hover:border-rose-400/50 hover:bg-slate-800/50'
                      }
                      focus:outline-2 focus:outline-offset-2 focus:outline-rose-400
                      min-h-[140px] flex flex-col justify-between cursor-pointer
                    `}
                  >
                    {/* Checkmark indicator */}
                    {isSelected && (
                      <div
                        className="absolute top-2 right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center animate-pulse"
                        aria-hidden="true"
                      >
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}

                    {/* Card content */}
                    <div className="flex-1">
                      <div className="text-lg font-bold text-rose-300 mb-1 group-hover:text-rose-200 transition-colors">
                        {card.name}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-3 group-hover:text-slate-300 transition-colors">
                        {card.effect || 'Sem descrição'}
                      </p>
                    </div>

                    {/* Mark count indicator */}
                    {card.marks && card.marks.length > 0 && (
                      <div
                        className="mt-2 text-xs font-medium text-rose-200 bg-rose-500/20 px-2 py-1 rounded w-fit"
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
        <div className="p-4 bg-slate-950/50 border-t border-rose-700/20 flex gap-3 justify-end">
          <Tooltip
            id="choice-cancel-tooltip"
            text="Cancelar seleção (Escape)"
            direction="top"
          >
            <button
              onClick={() => onSelect(cards[Math.floor(Math.random() * cards.length)])}
              aria-label="Cancelar a seleção e fechar o diálogo"
              className="
                px-4 py-2 rounded-lg font-medium text-slate-300
                border border-slate-700 hover:border-slate-600 hover:bg-slate-700/30
                transition-all duration-200 focus:outline-2 focus:outline-offset-2 focus:outline-slate-400
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
                  ? 'bg-rose-500/30 text-rose-300/50 border border-rose-500/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 border border-rose-400/50 focus:outline-rose-400 shadow-lg hover:shadow-rose-500/20'
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
