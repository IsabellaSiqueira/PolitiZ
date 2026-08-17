/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flame, Star, Check, X, Share2 } from 'lucide-react';
import { BILLS } from '../data';
import { Vote } from '../types';

interface RetratoParlamentarProps {
  votes: Vote[];
  onRestart: () => void;
  onClose: () => void;
}

export const RetratoParlamentar: React.FC<RetratoParlamentarProps> = ({ votes, onRestart, onClose }) => {
  const approvedVotes = votes.filter((v) => v.direction === 'aprovar');
  const approvalRate = Math.round((approvedVotes.length / votes.length) * 100);

  const partyCounts: Record<string, number> = {};
  approvedVotes.forEach((v) => {
    const bill = BILLS.find((b) => b.id === v.billId);
    if (bill) partyCounts[bill.partido] = (partyCounts[bill.partido] || 0) + 1;
  });
  const topParties = Object.entries(partyCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([party]) => party);

  const handleShare = async () => {
    const text = `Votei às cegas em 5 leis reais no Tinder das Leis do PolitiZ e aprovei ${approvalRate}% delas. Bora descobrir seu Retrato Parlamentar também!`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // usuário cancelou o share, sem problema
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="text-center py-2">
      <div className="w-20 h-20 bg-c-yellow border-[3px] border-black rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
        <Flame className="w-10 h-10 text-black fill-black" />
        <div className="absolute -bottom-1 -right-1 bg-c-orange border-2 border-black p-0.5 text-white rounded-lg">
          <Star className="w-4 h-4 fill-white" />
        </div>
      </div>

      <h2 className="font-display font-black text-2xl text-black tracking-tighter uppercase leading-none mb-1">
        SEU RETRATO PARLAMENTAR
      </h2>
      <p className="font-display font-bold text-c-orange text-xs uppercase tracking-wider mb-4">
        VOTO ÀS CEGAS FINALIZADO
      </p>

      <div className="bg-white border-2 border-black p-4 mb-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl">
        <span className="font-display font-black text-[10px] uppercase text-zinc-500 block leading-none mb-1">TAXA DE APROVAÇÃO</span>
        <span className="font-display font-black text-4xl text-black block tracking-tight">{approvalRate}%</span>
        {topParties.length > 0 && (
          <p className="font-sans font-medium text-[11px] text-zinc-600 mt-2">
            Você mais concordou com parlamentares do(a) <strong className="text-black">{topParties.join(', ')}</strong>
          </p>
        )}
      </div>

      {/* PL BY PL BREAKDOWN */}
      <div className="border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] divide-y-2 divide-black rounded-xl overflow-hidden mb-5 text-left">
        {votes.map((v) => {
          const bill = BILLS.find((b) => b.id === v.billId);
          if (!bill) return null;
          const approved = v.direction === 'aprovar';
          return (
            <div key={v.billId} className="p-3 flex items-center gap-3">
              <div className={`w-7 h-7 shrink-0 border-2 border-black rounded-full flex items-center justify-center ${approved ? 'bg-[#22C55E]' : 'bg-[#BF1836]'}`}>
                {approved ? <Check className="w-4 h-4 text-black stroke-[3px]" /> : <X className="w-4 h-4 text-white stroke-[3px]" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-display font-black text-[10px] uppercase text-black block truncate">
                  {bill.plNumber} · {bill.tema}
                </span>
                <span className="text-[10px] text-zinc-500 font-sans font-medium block truncate">
                  {bill.autor} ({bill.partido}-{bill.estado})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="font-sans font-medium text-xs text-zinc-650 mb-5 leading-relaxed">
        Nenhum político cabe 100% numa etiqueta — e você também não. O Diário Oficial é público, é só saber onde olhar.
      </p>

      <div className="space-y-2.5">
        <button
          onClick={handleShare}
          className="w-full bg-c-yellow text-black hover:bg-black hover:text-white font-display font-black text-xs py-3.5 border-2 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-full flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" /> Compartilhar resultado
        </button>

        <button
          onClick={onRestart}
          className="w-full bg-white text-zinc-650 hover:text-black font-display font-black text-[10px] py-1.5 border-2 border-black uppercase tracking-wider cursor-pointer rounded-full"
        >
          Votar de novo
        </button>

        <button
          onClick={onClose}
          className="w-full bg-zinc-200 hover:bg-black hover:text-white transition-colors text-black font-display font-black text-[10px] py-2.5 border-2 border-black uppercase tracking-wider cursor-pointer rounded-full"
        >
          FECHAR E VOLTAR AO MAPA
        </button>
      </div>
    </div>
  );
};
