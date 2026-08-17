/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { LearningPath } from './components/LearningPath';
import { RewardSection } from './components/RewardSection';
import { BottomNav } from './components/BottomNav';
import { LessonInfoModal } from './components/LessonInfoModal';
import { QuizModal } from './components/QuizModal';
import { LabAuditorModal } from './components/LabAuditorModal';
import { VanguardaTab, PerfilTab } from './components/ExtraTabs';
import { LESSONS } from './data';
import { LessonNode } from './types';
import { AlertCircle, Terminal, HelpCircle, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

export default function App() {
  // Gamified State Loop
  const [points, setPoints] = useState<number>(450);
  const [lessons, setLessons] = useState<LessonNode[]>(LESSONS);
  const [activeTab, setActiveTab] = useState<'trilhas' | 'vanguarda' | 'perfil'>('trilhas');

  // Modals Visibility Management
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Handle lesson interactions from path nodes
  const handleNodeClick = (lesson: LessonNode) => {
    if (lesson.status === 'locked') {
      setWarningMessage(
        `CONTEÚDO BLOQUEADO! Termine a ${
          lesson.id === 3 ? 'Aula 2 (Quiz)' : 'Aula anterior'
        } de forma brilhante para acessar "${lesson.title.replace(/Aula \d+:\s*/, '')}".`
      );
      setIsWarningOpen(true);
      return;
    }

    if (lesson.id === 1) {
      // Completed, open Theory reviewing workbook
      setIsTheoryOpen(true);
    } else if (lesson.id === 2) {
      // Active Quiz, open interactive testing modals
      setIsQuizOpen(true);
    }
  };

  // Callback once the Quiz is successfully passed
  const handleQuizComplete = (gainedPoints: number) => {
    setPoints((prev) => prev + gainedPoints);
    
    // Update timeline statuses
    setLessons((prevLessons) =>
      prevLessons.map((l) => {
        if (l.id === 2) {
          return { ...l, status: 'completed' };
        }
        if (l.id === 3) {
          // Unlock Class 3!
          return { ...l, status: 'active' };
        }
        return l;
      })
    );
  };

  // Handle minor points increment from and about the contradiction audits
  const handleGainPoints = (gainedPoints: number) => {
    setPoints((prev) => prev + gainedPoints);
  };

  return (
    <div className="min-h-screen bg-c-surface font-sans antialiased text-black relative md:py-8 md:px-4 flex items-center justify-center">
      {/* BACKGROUND BRUTALIST GRID DECORATIVE ELEMENT FOR LARGER DISPLAY RANGE */}
      <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.08] pointer-events-none" />

      {/* OUTERCARD DECK: CENTERING CONTAINER FOCUS FOR DESKTOP VIEWS */}
      <div 
        id="politiq-mobile-wrapper"
        className="w-full max-w-md bg-white min-h-screen md:min-h-[85vh] md:my-4 border-[3px] border-black relative flex flex-col shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden md:rounded-[28px]"
      >
        {/* TOP STATUS BAR DECORATOR (ZINE ROUGHCUT SIGHT) */}
        <div className="bg-black text-white text-[9px] font-mono leading-none py-2.5 px-5 flex justify-between items-center select-none tracking-widest border-b-2 border-black">
          <span>POLITIQ_MOBILE_V1.1_SYS</span>
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
            <span className="text-c-yellow">● ACTV_AUDIT</span>
          </span>
        </div>

        {/* HEADER MOUNT */}
        <Header points={points} />

        {/* CENTRAL VIEWPORT WORKSPACE (SCROLLABLE) */}
        <main className="flex-1 overflow-y-auto pb-28">
          {activeTab === 'trilhas' ? (
            <div>
              {/* HERO SECTION DECK */}
              <div className="bg-white border-b-4 border-black p-5 relative overflow-hidden select-none">
                {/* DECORATIVE STICKER TAGS */}
                <div 
                  style={{ transform: 'rotate(-3deg)' }}
                  className="absolute top-4 right-3 bg-c-orange text-white border-2 border-black text-[9px] font-display font-black tracking-widest px-2.5 py-1 uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] rounded-md"
                >
                  MÓDULO BÁSICO ✓
                </div>

                <span className="font-display font-black text-xs text-c-orange block tracking-widest mb-1.5 uppercase">
                  TRILHA REVOLUCIONÁRIA ✦
                </span>

                <h1 className="font-display font-black text-3.5xl tracking-tighter uppercase text-black leading-[0.9] max-w-[85%] break-words">
                  MÓDULO 01:<br />
                  O ESTADO<br />
                  E A CLASSE
                </h1>

                <p className="font-sans font-medium text-xs text-zinc-650 mt-3 max-w-[90%] leading-relaxed">
                  Destrinche a arquitetura do poder público, tire a máscara neutra do Estado de bem-estar social e domine o jogo político pela teoria crítica da luta de classes.
                  <span className="font-display font-black text-[10px] text-black uppercase mt-1 block tracking-wider">✦ APRENDA & AUDITE EM TEMPO REAL ✦</span>
                </p>

                {/* SMALL DECORATIVE COUNTER DOTS */}
                <div className="flex gap-2 mt-4 select-none">
                  <div className="w-3 h-3 bg-c-yellow border-2 border-black rounded-sm" />
                  <div className="w-3 h-3 bg-c-orange border-2 border-black rounded-sm" />
                  <div className="w-3 h-3 bg-black border-2 border-black rounded-sm" />
                </div>
              </div>

              {/* TIMELINE PATH MOUNT */}
              <div className="my-2">
                <LearningPath lessons={lessons} onNodeClick={handleNodeClick} />
              </div>

              {/* REWARD CALL WORKBENCH SECTION */}
              <div className="border-t-4 border-black bg-c-orange/5 py-4">
                <RewardSection onOpenLab={() => setIsLabOpen(true)} />
              </div>
            </div>
          ) : activeTab === 'vanguarda' ? (
            /* LEADERBOARD VIEW */
            <VanguardaTab points={points} onOpenLab={() => setIsLabOpen(true)} />
          ) : (
            /* USER RANK PROFILE VIEW */
            <PerfilTab points={points} onOpenLab={() => setIsLabOpen(true)} />
          )}
        </main>

        {/* BOTTOM NAVIGATION MOUNT */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* ================= MODALS DECK ================= */}

        {/* THEORY BOOKNOTE WORKBOOK DRAWERS */}
        <LessonInfoModal 
          isOpen={isTheoryOpen} 
          onClose={() => setIsTheoryOpen(false)} 
        />

        {/* QUIZ DRAWER MULTI-QUESTIONS COMPONENT */}
        <QuizModal 
          isOpen={isQuizOpen} 
          onClose={() => setIsQuizOpen(false)} 
          onComplete={handleQuizComplete} 
        />

        {/* CONTRADICTION LABORATORY WORKBENCH */}
        <LabAuditorModal 
          isOpen={isLabOpen} 
          onClose={() => setIsLabOpen(false)} 
          onGainPoints={handleGainPoints}
        />

        {/* SYSTEM WARNING DRAWER */}
        {isWarningOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <div 
              style={{ transform: 'rotate(0.5deg)' }}
              className="w-full max-w-xs bg-white border-[3px] border-black p-5 relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center rounded-2xl animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-c-orange text-white border-2 border-black rounded-2xl flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 stroke-[3px]" />
              </div>

              <h3 className="font-display font-black text-md text-black uppercase tracking-tight mb-2">
                ACESSO RESTRITO
              </h3>

              <p className="font-sans font-medium text-xs text-zinc-700 leading-normal mb-4">
                {warningMessage}
              </p>

              <button 
                onClick={() => setIsWarningOpen(false)}
                className="w-full bg-c-yellow text-black border-2 border-black font-display font-black text-xs py-3.5 uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer rounded-2xl"
              >
                ENTENDIDO! VOLTAR
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

