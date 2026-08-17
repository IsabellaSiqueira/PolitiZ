/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Route, Trophy, Fingerprint } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'trilhas' | 'vanguarda' | 'perfil';
  setActiveTab: (tab: 'trilhas' | 'vanguarda' | 'perfil') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'trilhas' as const,
      label: 'TRILHAS',
      icon: Route,
    },
    {
      id: 'vanguarda' as const,
      label: 'VANGUARDA',
      icon: Trophy,
    },
    {
      id: 'perfil' as const,
      label: 'PERFIL',
      icon: Fingerprint,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-4 border-black grid grid-cols-3 z-40 select-none pb-safe">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-3.5 px-1 border-r border-[#000] last:border-r-0 transition-all cursor-pointer relative overflow-hidden group ${
              isActive 
                ? 'bg-[#FFCC4A] text-black font-black' 
                : 'bg-white text-black hover:bg-zinc-50 font-bold'
            }`}
          >
            <div className={`transition-transform duration-200 ${isActive ? 'scale-110 -rotate-2' : 'group-hover:scale-105'}`}>
              <IconComponent 
                className={`w-5 h-5 mb-1 ${isActive ? 'stroke-[3px] text-[#F0531F]' : 'stroke-[2px] text-black'}`} 
              />
            </div>
            <span className="font-display text-[10px] tracking-widest uppercase select-none font-extrabold">
              {tab.label}
            </span>
            {isActive && (
              <span className="absolute top-1 right-2 text-[8px] animate-pulse text-[#F0531F]">✦</span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
