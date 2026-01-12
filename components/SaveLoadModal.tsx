
import React, { useState, useRef, useEffect } from 'react';

interface SaveLoadModalProps {
  mode: 'save' | 'load';
  saveCode?: string;
  onClose: () => void;
  onLoad: (code: string) => void;
}

const SaveLoadModal: React.FC<SaveLoadModalProps> = ({ mode, saveCode, onClose, onLoad }) => {
  const [importCode, setImportCode] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copiar');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (mode === 'save' && textareaRef.current) {
      textareaRef.current.select();
    }
  }, [mode]);

  const handleCopy = () => {
    if (saveCode) {
      navigator.clipboard.writeText(saveCode).then(() => {
        setCopyButtonText('Copiado!');
        setTimeout(() => setCopyButtonText('Copiar'), 2000);
      });
    }
  };
  
  const handleLoadClick = () => {
      if(importCode.trim()) {
          onLoad(importCode.trim());
      }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-indigo-700/50 rounded-2xl p-6 shadow-2xl w-full max-w-lg text-center flex flex-col">
        <h2 className="text-2xl font-mystic text-amber-300 mb-2">
          {mode === 'save' ? 'Exportar Progresso' : 'Importar Progresso'}
        </h2>
        
        {mode === 'save' ? (
          <>
            <p className="text-slate-400 mb-4 text-sm">Copie este código para salvar seu progresso. Guarde-o em um lugar seguro.</p>
            <textarea
              ref={textareaRef}
              readOnly
              value={saveCode}
              className="w-full h-48 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </>
        ) : (
          <>
            <p className="text-slate-400 mb-4 text-sm">Cole seu código de salvamento abaixo para carregar seu progresso.</p>
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="Cole seu código aqui..."
              className="w-full h-48 bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-300 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="bg-red-900/30 border border-red-500/50 text-red-300 text-xs p-3 rounded-md mt-4">
              <strong>Atenção:</strong> Carregar um jogo substituirá seu progresso atual permanentemente.
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-2 rounded-lg transition-colors">
            {mode === 'save' ? 'Fechar' : 'Cancelar'}
          </button>
          {mode === 'save' ? (
            <button onClick={handleCopy} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2 rounded-lg transition-colors w-28">
              {copyButtonText}
            </button>
          ) : (
            <button onClick={handleLoadClick} disabled={!importCode.trim()} className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
              Carregar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveLoadModal;
