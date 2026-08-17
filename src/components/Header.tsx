/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award } from 'lucide-react';

interface HeaderProps {
  points: number;
}

export const Header: React.FC<HeaderProps> = ({ points }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b-4 border-black p-4 flex justify-between items-center select-none">
      {/* BRAND LOGO */}
      <div className="flex items-center gap-1.5">
        <h1 className="font-display font-black text-3xl tracking-tighter uppercase italic text-black">
          politi<span className="text-[#F0531F]">Q</span>
        </h1>
        <div style={{ transform: 'rotate(-3deg)' }} className="bg-black text-white px-2 py-0.5 text-[9px] font-display font-black tracking-widest border border-black inline-block uppercase shadow-[1.5px_1.5px_0px_0px_rgba(240,83,31,1)] rounded-sm">
          AUDITOR
        </div>
      </div>

      {/* SCORE DISK CARD */}
      <div 
        style={{ transform: 'rotate(1.5deg)' }} 
        className="bg-[#FFCC4A] border-2 border-black font-display font-black text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] transition-all cursor-cell rounded-full"
      >
        <span className="text-black text-sm">✦</span>
        <span className="tracking-tight text-black">{points} PONTOS CRÍTICOS</span>
      </div>
    </header>
  );
};
