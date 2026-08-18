/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePersistentState } from './lib/storage';
import { Header } from './components/Header';
import { LearningPath } from './components/LearningPath';
import { RewardSection } from './components/RewardSection';
import { BottomNav } from './components/BottomNav';
import { TopNav } from './components/TopNav';
import { LessonInfoModal } from './components/LessonInfoModal';
import { QuizModal } from './components/QuizModal';
import { TinderDasLeisModal } from './components/TinderDasLeisModal';
import { VanguardaTab, PerfilTab } from './components/ExtraTabs';
import { LESSONS } from './data';
import { LessonNode } from './types';
import { AlertCircle, ShieldAlert, Zap } from 'lucide-react';

export default function App() {
  // Gamified State Loop — persisted so progress survives a reload
  const [points, setPoints] = usePersistentState<number>('points', 450);
  const [lessons, setLessons] = usePersistentState<LessonNode[]>('lessons', LESSONS);
  const [activeTab, setActiveTab] = useState<'trilhas' | 'vanguarda' | 'perfil'>('trilhas');

  // Modals Visibility Management
  const [isTheoryOpen, setIsTheoryOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isTinderOpen, setIsTinderOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // Handle lesson interactions from path nodes
  const handleNodeClick = (lesson: LessonNode) => {
    if (lesson.status === 'locked') {
      setWarningMessage(
        `CALMA AÍ! Termina a ${
          lesson.id === 3 ? 'Aula 2 (Quiz)' : 'aula anterior'
        } primeiro pra destravar "${lesson.title.replace(/Aula \d+:\s*/, '')}".`
      );
      setIsWarningOpen(true);
      return;
    }

    if (lesson.status === 'soon') {
      setWarningMessage(
        `AINDA TÁ NO FORNO! "${lesson.title.replace(/Aula \d+:\s*/, '')}" já foi desbloqueada por você, mas o conteúdo ainda tá em produção. Volta em breve.`
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
          // Content isn't built yet — say so honestly instead of faking "active"
          return { ...l, status: 'soon' };
        }
        return l;
      })
    );
  };

  // Handle points increment from the Tinder das Leis voting game
  const handleGainPoints = (gainedPoints: number) => {
    setPoints((prev) => prev + gainedPoints);
  };

  const openTinder = () => setIsTinderOpen(true);

  return (
    <div className="min-h-screen bg-c-surface font-sans antialiased text-black relative">
      {/* BACKGROUND BRUTALIST GRID DECORATIVE ELEMENT FOR LARGER DISPLAY RANGE */}
      <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.08] pointer-events-none" />

      {/* DESKTOP TOP NAVIGATION (hidden below md, renders nothing on mobile) */}
      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} points={points} onOpenLab={openTinder} />

      {/* MOBILE CENTERING WRAPPER / DESKTOP FULL-WIDTH FLOW */}
      <div className="flex items-center justify-center md:block min-h-screen md:min-h-0 md:py-0 relative">
        <div
          id="politiz-shell"
          className="w-full max-w-md md:max-w-none bg-white md:bg-transparent min-h-screen md:min-h-0 border-4 md:border-0 border-black relative flex flex-col shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] md:shadow-none overflow-hidden md:overflow-visible"
        >
          {/* TOP STATUS BAR DECORATOR (ZINE ROUGHCUT SIGHT) — mobile only */}
          <div className="md:hidden bg-black text-white text-[9px] font-mono leading-none py-2.5 px-5 flex justify-between items-center select-none tracking-widest border-b-2 border-black">
            <span>POLITIZ_MOBILE_V1.1_SYS</span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              <span className="text-c-yellow">● ACTV_AUDIT</span>
            </span>
          </div>

          {/* HEADER MOUNT — mobile only, desktop uses TopNav instead */}
          <div className="md:hidden">
            <Header points={points} />
          </div>

          {/* CENTRAL VIEWPORT WORKSPACE (SCROLLABLE) */}
          <main className="flex-1 overflow-y-auto md:overflow-visible pb-28 md:pb-0">
            {activeTab === 'trilhas' ? (
              <div>
                {/* HERO SECTION DECK */}
                <div className="bg-white border-b-[3px] md:border-b-0 border-black p-5 md:p-0 md:py-16 relative overflow-hidden select-none">
                  <div className="md:max-w-6xl md:mx-auto md:px-6 md:grid md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:items-center">
                    <div>
                      {/* DECORATIVE STICKER TAGS */}
                      <div
                        style={{ transform: 'rotate(-3deg)' }}
                        className="absolute top-4 right-3 md:static md:inline-block md:mb-6 bg-c-orange text-white border-2 border-black text-[9px] font-display font-black tracking-widest px-2.5 py-1 uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] rounded-md"
                      >
                        MÓDULO BÁSICO ✓
                      </div>

                      <span className="font-display font-black text-xs md:text-sm text-c-orange block tracking-widest mb-1.5 uppercase">
                        NOSSA TRILHA ✦
                      </span>

                      <h1 className="font-display font-black text-3.5xl md:text-6xl tracking-tighter uppercase text-black leading-[0.9] max-w-[85%] md:max-w-none break-words">
                        MÓDULO 01:<br />
                        O ESTADO<br />
                        E A CLASSE
                      </h1>

                      <p className="font-sans font-medium text-xs md:text-base text-zinc-650 mt-3 md:mt-5 max-w-[90%] md:max-w-lg leading-relaxed">
                        Entende como o poder realmente funciona, tira a máscara do Estado "neutro" e descobre quem manda de verdade no jogo político.
                        <span className="font-display font-black text-[10px] md:text-xs text-black uppercase mt-1 block tracking-wider">✦ BORA APRENDER E AUDITAR ✦</span>
                      </p>

                      {/* SMALL DECORATIVE COUNTER DOTS */}
                      <div className="flex gap-2 mt-4 md:mt-7 select-none">
                        <div className="w-3 h-3 bg-c-yellow border-2 border-black rounded-sm" />
                        <div className="w-3 h-3 bg-c-orange border-2 border-black rounded-sm" />
                        <div className="w-3 h-3 bg-black border-2 border-black rounded-sm" />
                      </div>

                      {/* DESKTOP-ONLY QUICK CTA */}
                      <button
                        onClick={openTinder}
                        className="hidden md:inline-block mt-8 bg-black text-white hover:bg-c-orange font-display font-black text-xs px-7 py-3.5 border-2 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer rounded-full"
                      >
                        Vota nas leis ➜
                      </button>
                    </div>

                    {/* DESKTOP-ONLY DECORATIVE STICKER COLLAGE */}
                    <div className="hidden md:flex items-center justify-center relative h-[420px]">
                      <div style={{ transform: 'rotate(-4deg)' }} className="absolute w-72 h-72 bg-c-yellow border-[3px] border-black rounded-[42%_58%_65%_35%/45%_40%_60%_55%] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" />
                      <div style={{ transform: 'rotate(3deg)' }} className="relative z-10 bg-black w-56 h-56 rounded-full border-[3px] border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(240,83,31,1)]">
                        <span className="font-display font-black text-[110px] italic leading-none text-c-orange">Q</span>
                      </div>
                      <div style={{ transform: 'rotate(12deg)' }} className="absolute top-2 right-6 bg-c-pink border-[3px] border-black rounded-2xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <ShieldAlert className="w-8 h-8 text-black stroke-[2.5px]" />
                      </div>
                      <div style={{ transform: 'rotate(-10deg)' }} className="absolute bottom-4 left-0 bg-c-teal border-[3px] border-black rounded-2xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Zap className="w-8 h-8 text-white stroke-[2.5px] fill-white" />
                      </div>
                      <div style={{ transform: 'rotate(-3deg)' }} className="absolute -bottom-2 right-4 bg-white border-[3px] border-black rounded-full px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-display font-black text-[10px] uppercase">
                        ✦ Voto às cegas
                      </div>
                    </div>
                  </div>
                </div>

                {/* TIMELINE + REWARD: STACKED ON MOBILE, MAIN+SIDEBAR ON DESKTOP */}
                <div className="md:max-w-6xl md:mx-auto md:px-6 md:grid md:grid-cols-[1fr_360px] md:gap-10 md:items-start md:mt-4">
                  {/* TIMELINE PATH MOUNT — full-bleed color band on mobile */}
                  <div className="bg-c-lilac/15 md:bg-transparent border-b-[3px] md:border-b-0 border-black">
                    <LearningPath lessons={lessons} onNodeClick={handleNodeClick} />
                  </div>

                  {/* REWARD CALL WORKBENCH SECTION — full-bleed color band on mobile */}
                  <div className="border-t-[3px] md:border-t-0 border-black bg-c-yellow/20 md:bg-transparent py-4 md:py-0 md:sticky md:top-28">
                    <RewardSection onOpenLab={openTinder} />
                  </div>
                </div>
              </div>
            ) : activeTab === 'vanguarda' ? (
              /* LEADERBOARD VIEW — full-bleed teal band on mobile */
              <div className="bg-c-teal/10 md:bg-transparent min-h-full md:min-h-0 md:max-w-3xl md:mx-auto md:px-6 md:py-12">
                <VanguardaTab points={points} onOpenLab={openTinder} />
              </div>
            ) : (
              /* USER RANK PROFILE VIEW — full-bleed pink band on mobile */
              <div className="bg-c-pink/10 md:bg-transparent min-h-full md:min-h-0 md:max-w-3xl md:mx-auto md:px-6 md:py-12">
                <PerfilTab points={points} onOpenLab={openTinder} />
              </div>
            )}
          </main>

          {/* BOTTOM NAVIGATION MOUNT — mobile only, desktop uses TopNav instead */}
          <div className="md:hidden">
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

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

          {/* TINDER DAS LEIS — BLIND VOTING GAME */}
          <TinderDasLeisModal
            isOpen={isTinderOpen}
            onClose={() => setIsTinderOpen(false)}
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
                  AINDA NÃO ROLA
                </h3>

                <p className="font-sans font-medium text-xs text-zinc-700 leading-normal mb-4">
                  {warningMessage}
                </p>

                <button
                  onClick={() => setIsWarningOpen(false)}
                  className="w-full bg-c-yellow text-black border-2 border-black font-display font-black text-xs py-3.5 uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer rounded-full"
                >
                  SAQUEI, VOLTAR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
