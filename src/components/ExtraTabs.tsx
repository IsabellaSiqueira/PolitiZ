/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, ShieldCheck, Flame, Star, Zap, Library, UserCheck, HelpCircle } from 'lucide-react';
import { LEADERBOARD } from '../data';

interface ExtraTabsProps {
  points: number;
  onOpenLab: () => void;
}

export const VanguardaTab: React.FC<ExtraTabsProps> = ({ points }) => {
  // Update user score dummy dynamically matching parent trigger
  const updatedLeaderboard = LEADERBOARD.map(u => {
    if (u.isCurrentUser) {
      return { ...u, points };
    }
    return u;
  }).sort((a, b) => b.points - a.points);

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-200 select-none">
      {/* HEADER BILLBOARD */}
      <div style={{ transform: 'rotate(-0.5deg)' }} className="bg-black text-white p-4 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(255,204,74,1)] rounded-2xl">
        <h2 className="font-display font-black text-2xl tracking-tighter uppercase leading-none mb-1">
          VANGUARDA CRÍTICA
        </h2>
        <p className="font-display font-bold text-xs text-c-yellow uppercase tracking-wider">
          RANKING DE QUEM TÁ LIGADO
        </p>
      </div>

      <p className="font-sans font-medium text-xs text-zinc-700 leading-normal">
        Quem manja mais de teoria? Ganha ponto fazendo os quizzes da trilha e votando no Tinder das Leis.
      </p>

      {/* LEADERBOARD LIST CONTAINER */}
      <div className="border-[3px] border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] divide-y-2 divide-black rounded-2xl overflow-hidden">
        {updatedLeaderboard.map((user, idx) => {
          const isMe = user.isCurrentUser;
          const displayRank = idx + 1;

          return (
            <div 
              key={user.name} 
              className={`p-3.5 flex items-center justify-between font-sans transition-colors ${
                isMe ? 'bg-c-yellow/20 font-bold' : 'hover:bg-zinc-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* RANK BADGE */}
                <div className={`w-8 h-8 font-display font-black text-xs flex items-center justify-center border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] rounded-full ${
                  displayRank === 1 ? 'bg-c-yellow rotate-[-4deg]' :
                  displayRank === 2 ? 'bg-c-teal text-white rotate-3' :
                  displayRank === 3 ? 'bg-c-lilac -rotate-2' : 'bg-white'
                }`}>
                  #{displayRank}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-black text-xs uppercase tracking-tight text-black">
                      {user.name}
                    </span>
                    {isMe && (
                      <span className="bg-c-orange text-white text-[8px] font-display font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider rotate-[2deg]">
                        Você
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-sans font-medium block uppercase tracking-tight">
                    {user.role}
                  </span>
                </div>
              </div>

              {/* POINTS CONTRAST STAMP */}
              <div className="bg-black text-white font-mono text-[11px] font-bold px-2 py-1 border border-black shadow-[2px_2px_0px_0px_rgba(255,204,74,1)] rounded-md">
                {user.points} PTs
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER PUNK NOTICE */}
      <div className="bg-white border-2 border-dashed border-black p-3 text-center my-4 rotate-[0.5deg] rounded-xl">
        <p className="font-display text-[9px] font-black text-black uppercase tracking-wider leading-none">
          ✦ O DIÁRIO OFICIAL É DE TODO MUNDO. FISCALIZAR TAMBÉM É LUTA. ✦
        </p>
      </div>
    </div>
  );
};

export const PerfilTab: React.FC<ExtraTabsProps> = ({ points, onOpenLab }) => {
  // Unlocked milestones
  const badges = [
    { id: 1, title: "AUDITOR BÁSICO", desc: "Aprovado na Aula de Introdução ao Estado.", icon: ShieldCheck, unlocked: true, color: 'bg-c-orange' },
    { id: 2, title: "CRÍTICO DA LUTA", desc: "Completou a sabatina de classes do Módulo 1.", icon: Flame, unlocked: points >= 500, color: 'bg-c-pink' },
    { id: 3, title: "MESTRE DO DIÁRIO", desc: "Votou às cegas nas 5 leis do Tinder das Leis.", icon: Library, unlocked: points > 450, color: 'bg-c-teal' },
    { id: 4, title: "VANGUARDISTA", desc: "Figurou no Top 3 do ranking de agitadores.", icon: Star, unlocked: false, color: 'bg-c-lilac' }
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-200 select-none">
      {/* AVATAR HERO COMPONENT */}
      <div className="bg-white border-[3px] border-black p-4 relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 rounded-2xl">
        {/* AVATAR GLITCH CIRCLE */}
        <div style={{ transform: 'rotate(-2deg)' }} className="w-16 h-16 bg-c-yellow border-[3px] border-black relative flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 rounded-2xl">
          <span className="font-display font-black text-3xl">P</span>
          <div className="absolute -bottom-1 -right-1 bg-black text-c-yellow text-[8px] font-display font-black px-1.5 uppercase tracking-tight rounded-sm">
            LVL 4
          </div>
        </div>

        {/* AVATAR INFO */}
        <div className="flex-grow select-none">
          <span className="bg-black text-white text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 tracking-wider inline-block rotate-[1deg] rounded-sm">
            AUDITOR CRÍTICO
          </span>
          <h2 className="font-display font-black text-lg text-black uppercase tracking-tight mt-1 mb-0.5">
            AGITADOR_4593
          </h2>
          <span className="text-[10px] text-zinc-500 font-sans font-medium uppercase block leading-none">
            Ingressou em: Maio, 2026
          </span>
        </div>
      </div>

      {/* QUICK STATUS TICKERS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-c-yellow border-2 border-black p-3 text-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-2xl">
          <span className="font-display font-black text-xs uppercase text-black block leading-none">REP TOTAL</span>
          <span className="font-display font-black text-xl text-black block mt-1 tracking-tight">{points} PTS</span>
        </div>
        <div className="bg-black border-2 border-black p-3 text-center text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-2xl">
          <span className="font-display font-black text-xs uppercase text-c-yellow block leading-none">DISTINTIVOS</span>
          <span className="font-display font-black text-xl block mt-1 tracking-tight">{unlockedCount} / {badges.length}</span>
        </div>
      </div>

      {/* DISTINTIVOS COLLECTIONS */}
      <div className="space-y-2.5">
        <h3 className="font-display font-black text-xs uppercase text-black tracking-widest bg-white pl-1.5 border-l-4 border-black">
          DISTINTIVOS DE COMBATE
        </h3>

        <div className="space-y-2">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div 
                key={b.id} 
                className={`border-2 border-black p-3 flex gap-3 items-center transition-all rounded-xl ${
                  b.unlocked 
                    ? 'bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' 
                    : 'bg-zinc-100 text-zinc-400 border-dashed border-zinc-350'
                }`}
              >
                <div className={`w-10 h-10 border-2 border-black flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-full ${
                  b.unlocked ? b.color : 'bg-zinc-200 border-zinc-300 shadow-none'
                }`}>
                  <Icon className={`w-5 h-5 ${b.unlocked ? 'text-black' : 'text-zinc-450'}`} />
                </div>

                <div>
                  <h4 className="font-display font-black text-xs uppercase leading-none text-black">
                    {b.title}
                  </h4>
                  <p className="font-sans font-medium text-[10px] text-zinc-500 mt-0.5 leading-tight">
                    {b.desc}
                  </p>
                </div>

                {b.unlocked ? (
                  <span className="ml-auto text-xs font-display font-black text-c-orange">✓</span>
                ) : (
                  <span className="ml-auto text-xs font-display font-black text-zinc-405">🔒</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK LAB CTA */}
      <button 
        onClick={onOpenLab}
        className="w-full bg-c-orange text-white hover:bg-black font-display font-black text-xs py-3.5 border-2 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer rounded-full"
      >
        BORA VOTAR DE NOVO ➜
      </button>
    </div>
  );
};
