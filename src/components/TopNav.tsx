/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Route, Trophy, Fingerprint } from 'lucide-react';

interface TopNavProps {
  activeTab: 'trilhas' | 'vanguarda' | 'perfil';
  setActiveTab: (tab: 'trilhas' | 'vanguarda' | 'perfil') => void;
  points: number;
  onOpenLab: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ activeTab, setActiveTab, points, onOpenLab }) => {
  const tabs = [
    { id: 'trilhas' as const, label: 'Trilhas', icon: Route },
    { id: 'vanguarda' as const, label: 'Vanguarda', icon: Trophy },
    { id: 'perfil' as const, label: 'Perfil', icon: Fingerprint },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-c-surface/95 backdrop-blur-sm border-b-[3px] border-black select-none">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
        {/* LOGO BADGE */}
        <div style={{ transform: 'rotate(-2deg)' }} className="flex items-center gap-1.5 bg-c-lilac border-[3px] border-black rounded-2xl px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="font-display font-black text-2xl tracking-tighter uppercase italic text-black">
            politi<span className="text-c-orange">Z</span>
          </h1>
          <div style={{ transform: 'rotate(3deg)' }} className="bg-black text-white px-2 py-0.5 text-[9px] font-display font-black tracking-widest border border-black inline-block uppercase rounded-sm">
            AUDITOR
          </div>
        </div>

        {/* NAV LINKS */}
        <nav className="flex items-center gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-display font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(240,83,31,1)]'
                    : 'bg-transparent text-black border-transparent hover:border-black hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.5px]" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* RIGHT SIDE: SCORE + CTA */}
        <div className="flex items-center gap-3">
          <div className="bg-c-yellow border-2 border-black font-display font-black text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-full whitespace-nowrap">
            <span className="text-black text-sm">✦</span>
            <span className="tracking-tight text-black">{points} PTS</span>
          </div>
          <button
            onClick={onOpenLab}
            className="bg-c-orange text-white hover:bg-black font-display font-black text-xs px-5 py-2.5 border-2 border-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer rounded-full whitespace-nowrap"
          >
            Tinder das Leis
          </button>
        </div>
      </div>
    </header>
  );
};
