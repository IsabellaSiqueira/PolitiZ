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
      color: '#F0531F',
    },
    {
      id: 'vanguarda' as const,
      label: 'VANGUARDA',
      icon: Trophy,
      color: '#00A2AB',
    },
    {
      id: 'perfil' as const,
      label: 'PERFIL',
      icon: Fingerprint,
      color: '#C4ACFA',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-[3px] border-black grid grid-cols-3 z-40 select-none pb-safe">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center justify-center py-3 px-1 transition-all cursor-pointer relative overflow-hidden group"
          >
            <div
              style={{ backgroundColor: isActive ? tab.color : '#fff' }}
              className={`w-9 h-9 mb-1 border-2 border-black rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive ? 'scale-110 -rotate-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'group-hover:scale-105'
              }`}
            >
              <IconComponent
                className="w-4 h-4 text-black stroke-[2.5px]"
              />
            </div>
            <span className={`font-display text-[9px] tracking-widest uppercase select-none ${isActive ? 'font-black text-black' : 'font-bold text-zinc-500'}`}>
              {tab.label}
            </span>
            {isActive && (
              <span style={{ color: tab.color }} className="absolute top-1 right-3 text-[8px] animate-pulse">✦</span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
