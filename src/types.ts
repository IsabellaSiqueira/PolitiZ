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

export interface PoliticianContradiction {
  id: string;
  name: string;
  party: string;
  avatarColor: string;
  publicClaim: string; // O que ele diz em público
  realVotingRecord: string; // O que ele vota ou faz de verdade
  contradictionAnalysis: string; // Análise mordaz e punk da contradição
  severity: 'CONTRADIÇÃO LEVE' | 'HIPOCRISIA GRAVE' | 'ESTELIONATO ELEITORAL DE ELITE';
}
