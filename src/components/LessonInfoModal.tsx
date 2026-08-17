/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, AlertCircle, TrendingUp, HelpCircle } from 'lucide-react';

interface LessonInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LessonInfoModal: React.FC<LessonInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div 
        className="w-full max-w-sm bg-white border-[3px] border-black p-5 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-150 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-c-orange text-white border-2 border-black p-1.5 hover:bg-black hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl"
        >
          <X className="w-5 h-5 stroke-[3px]" />
        </button>

        {/* HEADER CONTAINER */}
        <div style={{ transform: 'rotate(-1deg)' }} className="bg-c-yellow border-2 border-black p-3 mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl">
          <span className="font-display font-black text-[10px] text-black block tracking-wider uppercase">MOD 01 • TEORIA</span>
          <h2 className="font-display font-black text-xl text-black tracking-tight uppercase leading-tight mt-0.5">
            AULA 1: O QUE É O ESTADO?
          </h2>
        </div>

        {/* METADATA TAG */}
        <div className="bg-black text-white text-[10px] uppercase font-display font-black tracking-widest px-2.5 py-1 mb-4 inline-block rounded-md">
          REVISÃO DE CONTEÚDO ✓
        </div>

        {/* BODY (SCROLLABLE CONTENT FOR SAFETY) */}
        <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          <p className="font-sans font-medium text-xs text-zinc-855 leading-relaxed">
            E aí, de volta! Bora relembrar rapidinho: o Estado não é essa coisa neutra e distante que te ensinaram na escola. Ele tem função clara, e tu precisa saber qual:
          </p>

          <div className="border-l-4 border-c-orange pl-3 space-y-1.5">
            <h3 className="font-display font-black text-sm uppercase text-black tracking-tighter">
              1. O Monopólio Weberiano
            </h3>
            <p className="font-sans font-medium text-xs text-zinc-700">
              Pra <strong className="text-black">Max Weber</strong>, o Estado é quem detém o <strong>monopólio da violência física legítima</strong>. Nenhuma outra instituição pode punir, prender ou entrar em guerra sem autorização dele.
            </p>
          </div>

          <div className="border-l-4 border-black pl-3 space-y-1.5">
            <h3 className="font-display font-black text-sm uppercase text-black tracking-tighter">
              2. O Comitê de Classe Marxista
            </h3>
            <p className="font-sans font-medium text-xs text-zinc-700">
              Já pra <strong className="text-black">Karl Marx</strong>, o Estado moderno funciona basicamente como o gerente dos <strong>negócios comuns da classe dominante</strong> (a burguesia), usando lei e força pra manter o capital fluindo.
            </p>
          </div>

          {/* QUOTE BLOCK */}
          <div className="bg-white border-2 border-black p-3.5 my-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden rounded-xl">
            <p className="font-display italic text-xs font-bold leading-tight uppercase text-black pr-2">
              &ldquo;QUEM NÃO COMPREENDE A TEORIA SE TORNA MARIONETE DA PRÁTICA ALHEIA.&rdquo;
            </p>
            <div className="absolute top-0 right-0 bg-c-orange text-white text-[8px] font-black tracking-wider px-1 inline-block border-l-2 border-b-2 border-black rounded-bl-md">
              ALERTA CRÍTICO
            </div>
          </div>

          {/* QUICK SUMMARY GRID */}
          <div className="bg-amber-100 border-2 border-black p-3 text-xs space-y-1 rounded-xl">
            <p className="font-display font-bold text-c-orange uppercase tracking-wide">PILARES DO ESTADO MODERNO:</p>
            <ul className="list-disc pl-4 space-y-1 font-medium text-zinc-750">
              <li><strong>Força:</strong> Polícia, exército e prisões.</li>
              <li><strong>Burocracia:</strong> Aparato legal de cobrança e alvarás.</li>
              <li><strong>Fisco:</strong> Impostos para financiar as engrenagens.</li>
            </ul>
          </div>
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={onClose}
          className="w-full mt-4 bg-black text-white hover:bg-c-orange transition-colors border-2 border-black py-3 font-display font-black text-xs text-center uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(255,204,74,1)] cursor-pointer rounded-full"
        >
          FECHAR E VOLTAR
        </button>
      </div>
    </div>
  );
};
