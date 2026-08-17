/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, Terminal, Sparkles, AlertCircle } from 'lucide-react';

interface RewardSectionProps {
  onOpenLab: () => void;
}

export const RewardSection: React.FC<RewardSectionProps> = ({ onOpenLab }) => {
  return (
    <div className="p-4 select-none">
      <div 
        style={{ transform: 'rotate(-0.5deg)' }}
        className="bg-[#F0531F] border-[3px] border-black p-5 relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-white select-none overflow-hidden hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all rounded-2xl"
      >
        {/* TOP GLITCH STICKER */}
        <div className="absolute top-0 right-0 bg-[#FFCC4A] text-black text-[9px] font-display font-black tracking-widest px-2.5 py-1 uppercase border-l-4 border-b-4 border-black font-bold rounded-bl-xl">
          CONQUISTA ATIVA 🔥
        </div>

        {/* TOP ACTION TAG */}
        <div className="bg-black text-white text-[10px] uppercase font-display font-black tracking-widest px-2.5 py-1 mb-4 inline-block border-2 border-black rotate-[-2deg] shadow-[2px_2px_0px_0px_rgba(255,204,74,1)] rounded-md">
          LABORATÓRIO DESBLOQUEADO
        </div>

        {/* REWARD HERO CONTAINER */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldAlert className="w-8 h-8 text-[#FFCC4A] stroke-[2.5px]" />
            <h2 className="font-display font-black text-[22px] tracking-tight text-white leading-none uppercase">
              AUDITOR DE CONTRADIÇÕES
            </h2>
          </div>
          
          <p className="font-sans font-medium text-xs text-amber-50 leading-relaxed pr-2">
            Você dominou a teoria. Agora, use esta ferramenta para desmascarar políticos com o Diário Oficial.
          </p>
        </div>

        {/* STICKER HIGHLIGHT TABLE */}
        <div className="bg-black/30 border-2 border-dashed border-white/20 p-3 mb-4 rounded-xl text-xs space-y-1.5 font-sans font-medium">
          <div className="flex items-center gap-1.5 text-[#FFCC4A]">
            <span className="text-[14px]">✦</span>
            <span>Cruze discursos pomposos com atas de votação real</span>
          </div>
          <div className="flex items-center gap-1.5 text-white">
            <span className="text-[14px]">✦</span>
            <span>Gere prontuários de incoerência e hipocrisia</span>
          </div>
        </div>

        {/* ENTRAR ACTION BUTTON */}
        <button 
          onClick={onOpenLab}
          className="w-full bg-black text-white hover:bg-[#FFCC4A] hover:text-black hover:scale-[1.01] border-[3px] border-black py-3.5 font-display font-black text-xs text-center uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer rounded-2xl"
        >
          ENTRAR NO LABORATÓRIO
        </button>

        {/* BRUTALIST GRID DECORATOR */}
        <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-black/10 rounded-full pointer-events-none" />
      </div>
    </div>
  );
};
