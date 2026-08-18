/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Scale } from 'lucide-react';
import { BILLS } from '../data';
import { Vote, VoteDirection } from '../types';
import { VoteCard } from './VoteCard';
import { VotingOverlay } from './VotingOverlay';
import { RetratoParlamentar } from './RetratoParlamentar';

interface TinderDasLeisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGainPoints: (points: number) => void;
}

type Phase = 'intro' | 'voting' | 'revealing' | 'result';

const POINTS_ON_COMPLETE = 50;

export const TinderDasLeisModal: React.FC<TinderDasLeisModalProps> = ({ isOpen, onClose, onGainPoints }) => {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [lastVote, setLastVote] = useState<Vote | null>(null);

  if (!isOpen) return null;

  const currentBill = BILLS[currentIdx];

  const resetState = () => {
    setPhase('intro');
    setCurrentIdx(0);
    setVotes([]);
    setLastVote(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleVote = (direction: VoteDirection) => {
    const vote: Vote = { billId: currentBill.id, direction };
    setVotes((prev) => [...prev, vote]);
    setLastVote(vote);
    setPhase('revealing');
  };

  const handleContinue = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= BILLS.length) {
      onGainPoints(POINTS_ON_COMPLETE);
      setPhase('result');
    } else {
      setCurrentIdx(nextIdx);
      setPhase('voting');
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setVotes([]);
    setLastVote(null);
    setPhase('voting');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none overflow-y-auto">
      <div
        className="w-full max-w-sm bg-c-surface border-[3px] border-black p-5 relative my-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[92vh] overflow-y-auto rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 bg-black text-white hover:bg-c-orange border-2 border-black p-1 hover:text-white transition-colors cursor-pointer rounded-xl z-20"
        >
          <X className="w-4 h-4 stroke-[3px]" />
        </button>

        {phase === 'intro' && (
          <div className="text-center pt-6">
            <div style={{ transform: 'rotate(-2deg)' }} className="w-16 h-16 bg-c-orange border-[3px] border-black rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Scale className="w-8 h-8 text-white stroke-[2.5px]" />
            </div>

            <h2 className="font-display font-black text-2xl tracking-tighter uppercase text-black leading-none mb-1">
              TINDER DAS LEIS
            </h2>
            <p className="font-display font-bold text-black text-[10px] uppercase tracking-widest bg-c-yellow inline-block px-2.5 py-1 border-2 border-black rotate-[1deg] rounded-md shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] mb-4">
              VOTO ÀS CEGAS
            </p>

            <p className="font-sans font-medium text-xs text-zinc-700 leading-relaxed mb-5">
              5 PLs reais, sem nome de autor — desliza pra <strong className="text-[#22C55E]">aprovar</strong> ou <strong className="text-[#BF1836]">rejeitar</strong> e descobre quem propôs cada um.
            </p>

            <button
              onClick={() => setPhase('voting')}
              className="w-full bg-black text-white hover:bg-c-orange transition-colors border-2 border-black py-3.5 font-display font-black text-xs text-center uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(255,204,74,1)] cursor-pointer rounded-full"
            >
              Começar a votar ➜
            </button>
          </div>
        )}

        {(phase === 'voting' || phase === 'revealing') && (
          <div className="pt-6">
            {phase === 'voting' ? (
              <VoteCard
                key={currentBill.id}
                bill={currentBill}
                index={currentIdx}
                total={BILLS.length}
                onVote={handleVote}
              />
            ) : (
              lastVote && (
                <VotingOverlay
                  bill={currentBill}
                  direction={lastVote.direction}
                  onContinue={handleContinue}
                />
              )
            )}
          </div>
        )}

        {phase === 'result' && (
          <div className="pt-6">
            <RetratoParlamentar votes={votes} onRestart={handleRestart} onClose={handleClose} />
          </div>
        )}
      </div>
    </div>
  );
};
