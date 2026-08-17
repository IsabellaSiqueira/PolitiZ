/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LessonNode {
  id: number;
  title: string;
  type: 'theory' | 'quiz' | 'locked';
  status: 'completed' | 'active' | 'locked';
  subtitle: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  role: string;
  points: number;
  isCurrentUser?: boolean;
}

export interface Bill {
  id: number;
  plNumber: string; // Ex: "PL 2630/2020"
  casa: 'Câmara' | 'Senado';
  tema: string; // Ex: "Liberdade & Redes"
  resumoNeutro: string; // Descrição despolarizada focada na proposta prática
  autor: string; // Nome real do parlamentar
  fotoUrl: string; // Foto oficial da Câmara/Senado
  partido: string; // Ex: "PT", "PL", "MDB"
  estado: string; // Ex: "SP", "RJ", "BA"
  curiosidade: string; // Contexto de bastidores sobre a tramitação
}

export type VoteDirection = 'aprovar' | 'rejeitar';

export interface Vote {
  billId: number;
  direction: VoteDirection;
}
