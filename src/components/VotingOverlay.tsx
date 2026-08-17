/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Bill, VoteDirection } from '../types';

interface VotingOverlayProps {
  bill: Bill;
  direction: VoteDirection;
  onContinue: () => void;
}

const SEARCH_PHRASES = [
  'Cruzando com o Diário Oficial...',
  'Consultando o painel de votações...',
  'Identificando o autor...',
];

export const VotingOverlay: React.FC<VotingOverlayProps> = ({ bill, direction, onContinue }) => {
  const [count, setCount] = useState(3);
  const [phase, setPhase] = useState<'countdown' | 'reveal'>('countdown');

  useEffect(() => {
    if (count <= 0) {
      setPhase('reveal');
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [count]);

  const approved = direction === 'aprovar';

  return (
    <div className="bg-white border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 min-h-[420px] flex flex-col items-center justify-center select-none">
      <AnimatePresence mode="wait">
        {phase === 'countdown' ? (
          <motion.div
            key="countdown"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <div className="w-24 h-24 bg-c-yellow border-[3px] border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <motion.span
                key={count}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-display font-black text-4xl text-black"
              >
                {count > 0 ? count : '!'}
              </motion.span>
            </div>
            <div className="flex items-center gap-1.5 font-display font-black text-[10px] uppercase tracking-widest text-zinc-500">
              <Search className="w-3.5 h-3.5" />
              {SEARCH_PHRASES[Math.max(0, 3 - count) % SEARCH_PHRASES.length]}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="w-full text-center"
          >
            <div
              className={`inline-flex items-center gap-1.5 font-display font-black text-[10px] uppercase tracking-widest px-2.5 py-1 border-2 border-black rounded-full mb-4 ${
                approved ? 'bg-[#22C55E] text-black' : 'bg-[#BF1836] text-white'
              }`}
            >
              {approved ? <ThumbsUp className="w-3.5 h-3.5" /> : <ThumbsDown className="w-3.5 h-3.5" />}
              Você {approved ? 'aprovou' : 'rejeitou'} esse PL
            </div>

            <div className="w-24 h-24 mx-auto rounded-full border-[3px] border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-zinc-100">
              <img
                src={bill.fotoUrl}
                alt={bill.autor}
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="font-display font-black text-xl text-black uppercase tracking-tight mt-3 leading-none">
              {bill.autor}
            </h3>
            <span className="font-mono text-[10px] font-bold bg-zinc-100 border border-black px-1.5 py-0.5 rounded-sm uppercase inline-block mt-1.5">
              {bill.partido} · {bill.estado} · {bill.casa}
            </span>

            <div className="bg-c-surface border-2 border-dashed border-black p-3 mt-4 rounded-xl text-left">
              <p className="font-display font-black text-[9px] text-c-orange uppercase tracking-wide mb-1">
                CURIOSIDADE:
              </p>
              <p className="font-sans font-medium text-xs text-zinc-700 leading-relaxed">
                {bill.curiosidade}
              </p>
            </div>

            <button
              onClick={onContinue}
              className="w-full mt-5 bg-black text-white hover:bg-c-orange transition-colors border-2 border-black py-3 font-display font-black text-xs text-center uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer rounded-full"
            >
              Próximo PL ➜
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
