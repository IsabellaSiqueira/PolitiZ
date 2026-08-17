/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, AlertCircle, HelpCircle, Flame, Star } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../data';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (gainedPoints: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  if (!isOpen) return null;

  const currentQuestion = QUIZ_QUESTIONS[currentIdx];
  const isCorrect = selectedOption === currentQuestion?.correctAnswer;

  const handleOptionSelect = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);
    if (optionIdx === currentQuestion.correctAnswer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleFinish = () => {
    // Complete the quiz and award points
    const pointsGained = score * 20; // 20 points per correct answer!
    onComplete(pointsGained > 0 ? pointsGained : 15); // guarantee some reward points
    setQuizFinished(false);
    setCurrentIdx(0);
    onClose();
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div 
        className="w-full max-w-sm bg-white border-[3px] border-black p-5 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-150 rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE X BUTTON */}
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-c-orange text-white border-2 border-black p-1.5 hover:bg-black hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl"
        >
          <X className="w-5 h-5 stroke-[3px]" />
        </button>

        {!quizFinished ? (
          <div>
            {/* QUIZ HEADER */}
            <div style={{ transform: 'rotate(0.5deg)' }} className="bg-c-yellow border-2 border-black p-3 mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-xl">
              <div className="flex justify-between items-center text-[10px] font-display font-black text-black">
                <span>QUIZ ATIVO • MÓDULO 01</span>
                <span>{currentIdx + 1} DE {QUIZ_QUESTIONS.length}</span>
              </div>
              <h2 className="font-display font-black text-md text-black uppercase tracking-tight leading-tight mt-1">
                LUTA DE CLASSES E CONHECIMENTO
              </h2>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full bg-white border-2 border-black h-4 mb-4 relative overflow-hidden rounded-full">
              <div 
                className="h-full bg-c-orange border-r-2 border-black transition-all duration-300 rounded-full"
                style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* QUESTION CONTAINER */}
            <div className="bg-white border-2 border-black p-4 mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] min-h-[90px] flex items-center rounded-xl">
              <p className="font-display font-bold text-sm tracking-tight text-black uppercase leading-tight">
                {currentQuestion.question}
              </p>
            </div>

            {/* OPTIONS */}
            <div className="space-y-2 mb-4">
              {currentQuestion.options.map((option, index) => {
                let btnStyle = "bg-white text-black border-2 border-black font-medium text-xs p-3 text-left w-full hover:bg-zinc-100 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] rounded-xl";
                
                if (isAnswered) {
                  if (index === currentQuestion.correctAnswer) {
                    btnStyle = "bg-c-yellow text-black font-black border-2 border-green-600 p-3 text-left w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl";
                  } else if (index === selectedOption) {
                    btnStyle = "bg-c-orange/20 text-black border-2 border-c-orange p-3 text-left w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-xl";
                  } else {
                    btnStyle = "bg-white/40 text-black/40 border-2 border-black/20 p-3 text-left w-full cursor-not-allowed rounded-xl";
                  }
                }

                return (
                  <button
                    key={index}
                    disabled={isAnswered}
                    onClick={() => handleOptionSelect(index)}
                    className={btnStyle}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* FEEDBACK ROW */}
            {isAnswered && (
              <div className="border-2 border-black bg-white p-3.5 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-2 duration-100 rounded-xl">
                <div className="flex items-center gap-1.5 mb-1.5">
                  {isCorrect ? (
                    <div className="bg-black text-c-yellow p-0.5 border border-black rounded-sm">
                      <Check className="w-4 h-4 stroke-[3px]" />
                    </div>
                  ) : (
                    <div className="bg-c-orange text-white p-0.5 border border-black rounded-sm">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )}
                  <span className="font-display font-black text-xs uppercase tracking-tight">
                    {isCorrect ? "MANDOU BEM! TÁ LIGADO." : "ERROU, MAS RELAXA. OLHA A EXPLICAÇÃO:"}
                  </span>
                </div>
                <p className="font-sans font-medium text-[11px] text-zinc-700 leading-normal">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* ACTION FOOTER */}
            {isAnswered && (
              <button
                onClick={handleNext}
                className="w-full bg-c-orange text-white hover:bg-black font-display font-black text-xs py-3.5 border-2 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer rounded-full"
              >
                {currentIdx + 1 === QUIZ_QUESTIONS.length ? "VER RESULTADOS ➜" : "PRÓXIMA PERGUNTA ➜"}
              </button>
            )}
          </div>
        ) : (
          /* FINISHED SCREEN */
          <div className="text-center py-2">
            <div className="w-20 h-20 bg-c-yellow border-[3px] border-black rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
              <Flame className="w-10 h-10 text-black fill-black" />
              <div className="absolute -bottom-1 -right-1 bg-c-orange border-2 border-black p-0.5 text-white rounded-lg">
                <Star className="w-4 h-4 fill-white" />
              </div>
            </div>

            <h2 className="font-display font-black text-2xl text-black tracking-tighter uppercase leading-none mb-1">
              MANDOU MUITO BEM!
            </h2>
            <p className="font-display font-bold text-c-orange text-xs uppercase tracking-wider mb-4">
              QUIZ FINALIZADO, GERAÇÃO!
            </p>

            <div className="bg-white border-2 border-black p-4 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left space-y-2 rounded-xl">
              <div className="flex justify-between items-center border-b border-black/25 pb-1 font-display font-bold text-xs uppercase">
                <span>RESPOSTAS CERTAS:</span>
                <span className="text-c-orange">{score} DE {QUIZ_QUESTIONS.length}</span>
              </div>
              <div className="flex justify-between items-center font-display font-bold text-xs uppercase pt-1">
                <span>PONTUAÇÃO OBTIDA:</span>
                <span className="text-black bg-c-yellow border border-black px-1.5 py-0.5 rounded-md">+{score * 20} PONTOS</span>
              </div>
            </div>

            <p className="font-sans font-medium text-xs text-zinc-650 mb-5 leading-relaxed">
              Com a teoria afiada e o Diário Oficial na mão, tu já tá pronto pra auditar os poderosos.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={handleFinish}
                className="w-full bg-c-yellow text-black hover:bg-black hover:text-white font-display font-black text-xs py-3.5 border-2 border-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer rounded-full"
              >
                RESGATAR PONTOS E LIBERAR TRILHA ✓
              </button>

              <button
                onClick={restartQuiz}
                className="w-full bg-white text-zinc-650 hover:text-black font-display font-black text-[10px] py-1.5 border-2 border-black uppercase tracking-wider cursor-pointer rounded-full"
              >
                REFAZER TESTE (SEM RECOMPENSA)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
