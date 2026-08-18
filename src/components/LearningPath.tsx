/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, Zap, Lock, Clock } from 'lucide-react';
import { LessonNode } from '../types';

interface LearningPathProps {
  lessons: LessonNode[];
  onNodeClick: (lesson: LessonNode) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({ lessons, onNodeClick }) => {
  return (
    <div className="relative py-8 px-4 select-none">
      {/* THICK VERTICAL BLACK SPINE */}
      <div className="absolute left-[34px] top-0 bottom-0 w-2 bg-black rounded-full" />

      {/* TIMELINE ROOT GROUP */}
      <div className="space-y-12 relative">
        {lessons.map((lesson, idx) => {
          const isCompleted = lesson.status === 'completed';
          const isActive = lesson.status === 'active';
          const isLocked = lesson.status === 'locked';
          const isSoon = lesson.status === 'soon';

          return (
            <div 
              key={lesson.id} 
              onClick={() => onNodeClick(lesson)}
              className="flex items-center gap-4 cursor-pointer group select-none"
            >
              {/* TIMELINE INDICATOR DOT CONTAINER */}
              <div className="relative z-10 flex-shrink-0">
                {isCompleted && (
                  <div 
                    title="Aula Concluída - Clique para rever anotações"
                    className="w-12 h-12 bg-black border-[3px] border-black font-bold flex items-center justify-center text-white shadow-[3px_3px_0px_0px_rgba(255,130,0,1)] hover:scale-110 active:scale-95 transition-transform rounded-2xl"
                  >
                    <Check className="w-5 h-5 stroke-[4px]" />
                  </div>
                )}

                {isActive && (
                  <div 
                    style={{ transform: 'rotate(-3deg)' }}
                    title="Aula Ativa - TESTE SEUS CONHECIMENTOS!"
                    className="w-14 h-14 bg-c-yellow border-[3px] border-black flex items-center justify-center text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:rotate-3 active:scale-95 transition-transform animate-pulse rounded-2xl relative"
                  >
                    <Zap className="w-6 h-6 text-black stroke-[3px] fill-c-yellow" />
                    {/* ACTIVE BADGE sticker */}
                    <div className="absolute -top-3.5 -right-3 bg-c-orange text-white border-2 border-black text-[8px] font-display font-black tracking-widest px-1.5 py-0.5 uppercase rotate-[8deg] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] scale-90 rounded-sm">
                      ATIVO
                    </div>
                  </div>
                )}

                {isLocked && (
                  <div
                    title="Aula Bloqueada"
                    className="w-12 h-12 bg-zinc-300 border-[3px] border-black flex items-center justify-center text-zinc-650 cursor-not-allowed rounded-2xl"
                  >
                    <Lock className="w-4 h-4 stroke-[2.5px]" />
                  </div>
                )}

                {isSoon && (
                  <div
                    title="Aula em produção"
                    className="w-12 h-12 bg-c-yellow/40 border-[3px] border-black border-dashed flex items-center justify-center text-c-orange cursor-pointer rounded-2xl"
                  >
                    <Clock className="w-4 h-4 stroke-[2.5px]" />
                  </div>
                )}
              </div>

              {/* LESSON DETAILS AND HEADER */}
              <div
                className={`flex-grow border-[3px] border-black p-4 select-none relative transition-[transform,box-shadow,background-color,color] ${
                  isActive
                    ? 'bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-2xl hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]'
                    : isCompleted
                      ? 'bg-white hover:bg-zinc-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl active:translate-y-0.5'
                      : isSoon
                        ? 'bg-c-yellow/10 text-zinc-700 hover:bg-c-yellow/20 border-dashed rounded-2xl'
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-100 cursor-not-allowed border-dashed rounded-2xl'
                }`}
              >
                {/* ROTATED CARD HEADER */}
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <span className={`font-display font-black text-xs uppercase tracking-tight ${
                    isActive ? 'text-c-orange' : isCompleted ? 'text-black' : isSoon ? 'text-c-orange' : 'text-zinc-500'
                  }`}>
                    {lesson.title}
                  </span>

                  {isCompleted && (
                    <span className="font-display font-black text-[9px] bg-black text-white px-1.5 uppercase tracking-wider py-0.5 rotate-[2deg] rounded-sm shrink-0">
                      FECHOU ✓
                    </span>
                  )}
                  {isActive && (
                    <span className="font-display font-black text-[9px] bg-c-orange text-white px-1.5 uppercase tracking-wider py-0.5 rotate-[-2deg] animate-bounce rounded-sm shrink-0">
                      JOGAR!
                    </span>
                  )}
                  {isSoon && (
                    <span className="font-display font-black text-[9px] bg-c-yellow text-black border border-black px-1.5 uppercase tracking-wider py-0.5 rotate-[-2deg] rounded-sm shrink-0">
                      EM BREVE
                    </span>
                  )}
                </div>

                {/* LESSON SUBTITLE TEXT */}
                <p className={`font-sans font-medium text-xs leading-normal ${
                  isLocked ? 'text-zinc-400' : 'text-zinc-700'
                }`}>
                  {lesson.subtitle}
                </p>

                {isActive && (
                  <div className="mt-3 flex items-center gap-2 font-display font-black text-[10px] uppercase text-black">
                    <span className="bg-c-yellow border-2 border-black px-1.5 py-0.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] rounded-md">
                      RECOMPENSA: +60 PONTOS
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
