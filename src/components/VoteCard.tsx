/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Landmark, Check, X } from 'lucide-react';
import { Bill, VoteDirection } from '../types';
import { getTemaColor } from '../lib/theme-colors';

interface VoteCardProps {
  bill: Bill;
  index: number;
  total: number;
  onVote: (direction: VoteDirection) => void;
}

const SWIPE_THRESHOLD = 100;

export const VoteCard: React.FC<VoteCardProps> = ({ bill, index, total, onVote }) => {
  const tema = getTemaColor(bill.tema);
  const x = useMotionValue(0);
  const rotate = useTransform(x, (v) => v * 0.08);
  const approveOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1]);
  const rejectOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const flungFar = Math.abs(info.offset.x) > SWIPE_THRESHOLD;
    const flungFast = Math.abs(info.velocity.x) > 500;
    if (flungFar || flungFast) {
      onVote(info.offset.x > 0 ? 'aprovar' : 'rejeitar');
    }
  };

  return (
    <div className="relative select-none">
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.9}
        onDragEnd={handleDragEnd}
        style={{ x, rotate }}
        className="relative bg-white border-[3px] border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-5 cursor-grab active:cursor-grabbing touch-none"
      >
        {/* APPROVE STAMP */}
        <motion.div
          style={{ opacity: approveOpacity }}
          className="absolute top-6 left-5 border-4 border-[#22C55E] text-[#22C55E] font-display font-black text-xl uppercase px-3 py-1 rotate-[-12deg] rounded-xl pointer-events-none"
        >
          Aprovar
        </motion.div>

        {/* REJECT STAMP */}
        <motion.div
          style={{ opacity: rejectOpacity }}
          className="absolute top-6 right-5 border-4 border-[#BF1836] text-[#BF1836] font-display font-black text-xl uppercase px-3 py-1 rotate-[12deg] rounded-xl pointer-events-none"
        >
          Rejeitar
        </motion.div>

        {/* CARD HEADER */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <div style={{ transform: 'rotate(-2deg)' }} className="bg-ink text-white px-3 py-1.5 rounded-md border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-display font-black text-base tracking-tight leading-none block">
              {bill.plNumber}
            </span>
          </div>
          <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-zinc-500 pt-1.5">
            {index + 1} DE {total}
          </span>
        </div>

        <div style={{ transform: 'rotate(-1deg)' }} className={`inline-block ${tema.bg} ${tema.text} border-2 border-black px-2.5 py-1 mb-4 font-display font-black text-[10px] uppercase tracking-wider rounded-md shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]`}>
          #{bill.tema}
        </div>

        {/* MYSTERY AUTHOR PLACEHOLDER */}
        <div className="w-16 h-16 mx-auto mb-3 bg-zinc-100 border-2 border-black border-dashed rounded-full flex items-center justify-center">
          <Landmark className="w-7 h-7 text-zinc-400 stroke-[2px]" />
        </div>

        <p className="font-sans font-medium text-sm text-black leading-relaxed text-center min-h-[110px] flex items-center justify-center">
          {bill.resumoNeutro}
        </p>

        <p className="text-center font-display font-black text-[9px] uppercase tracking-widest text-zinc-400 mt-4">
          Autoria oculta · {bill.casa}
        </p>
      </motion.div>

      {/* ACCESSIBLE VOTE BUTTONS */}
      <div className="flex items-center justify-center gap-6 mt-5">
        <button
          onClick={() => onVote('rejeitar')}
          aria-label="Rejeitar projeto"
          className="w-14 h-14 bg-white text-[#BF1836] border-[3px] border-black rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] transition-[transform,box-shadow,background-color,color] cursor-pointer"
        >
          <X className="w-6 h-6 stroke-[3px]" />
        </button>
        <button
          onClick={() => onVote('aprovar')}
          aria-label="Aprovar projeto"
          className="w-14 h-14 bg-black text-[#22C55E] border-[3px] border-black rounded-full flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] transition-[transform,box-shadow,background-color,color] cursor-pointer"
        >
          <Check className="w-6 h-6 stroke-[3px]" />
        </button>
      </div>
    </div>
  );
};
