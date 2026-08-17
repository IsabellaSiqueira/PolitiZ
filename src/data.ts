/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LessonNode, QuizQuestion, LeaderboardUser, PoliticianContradiction } from './types';

export const LESSONS: LessonNode[] = [
  {
    id: 1,
    title: "Aula 1: O que é o Estado?",
    type: "theory",
    status: "completed",
    subtitle: "Uma introdução zine ao monopólio da violência física legítima."
  },
  {
    id: 2,
    title: "Aula 2: Luta de Classes (QUIZ)",
    type: "quiz",
    status: "active",
    subtitle: "Teste seus conhecimentos teóricos sobre as forças motoras da história!"
  },
  {
    id: 3,
    title: "Aula 3: A Burguesia & O Capital",
    type: "locked",
    status: "locked",
    subtitle: "Como o detentor dos meios de produção dita as regras do jogo legislativo."
  },
  {
    id: 4,
    title: "Aula 4: Ideologia e Hegemonia",
    type: "locked",
    status: "locked",
    subtitle: "O mecanismo que faz com que as ideias da classe dominante pareçam naturais."
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Qual clássica definição de Max Weber molda a visão contemporânea sobre o Estado Moderno?",
    options: [
      "A representação imediata dos anseios pacíficos universais da sociedade civil.",
      "O monopólio do uso legítimo da força física e violência dentro de um território determinado.",
      "Um pacto puramente espiritual baseado em valores teocráticos inegociáveis.",
      "Uma diretoria autônoma dedicada a erradicar desigualdades sociais sem sobressaltos."
    ],
    correctAnswer: 1,
    explanation: "Weber descreve o Estado Moderno através do seu meio fundamental: a detenção exclusiva do monopólio da violência física dita 'legítima' sobre uma população e território."
  },
  {
    id: 2,
    question: "No Manifesto Comunista de Karl Marx e Friedrich Engels, o governo do Estado moderno é resumido como:",
    options: [
      "Um fórum neutro onde patrões e operários negociam em perfeita harmonia.",
      "Uma corte judicial soberana que visa somente o bem comum supranacional.",
      "Apenas um comitê para gerenciar os negócios comuns de toda a classe burguesa.",
      "Uma instituição independente e imune aos interesses financeiros corporativos."
    ],
    correctAnswer: 2,
    explanation: "Para o materialismo histórico, as estruturas jurídicas e políticas do Estado capitalista agem em última instância como um comitê gestor das necessidades gerais do capital."
  },
  {
    id: 3,
    question: "O que constitui a 'Infraestrutura' (ou Base) de uma sociedade, segundo a abordagem materialista?",
    options: [
      "As leis escritas, as religiões, as artes e as correntes filosóficas dominantes.",
      "As forças produtivas e as relações sociais de produção que determinam a vida econômica.",
      "A malha hidroviária, as estradas federais e o sistema de transporte coletivo urbano.",
      "O conjunto de discursos proferidos na mídia de massa pelos formadores de opinião."
    ],
    correctAnswer: 1,
    explanation: "A infraestrutura é a base material econômica (meios de produção + relações produtivas). Ela dá suporte e molda a 'superestrutura' (direito, política, religião, cultura, mídia)."
  }
];

export const LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: "Antônio 'Marighella' J.", role: "Militante Ouro", points: 850 },
  { rank: 2, name: "Patrícia Galvão (Pagu)", role: "Crítica Radical", points: 720 },
  { rank: 3, name: "Você (Auditor)", role: "Agitador Crítico", points: 450, isCurrentUser: true },
  { rank: 4, name: "Jefferson 'Sul' Ramos", role: "Fiscal de Gabinete", points: 410 },
  { rank: 5, name: "Laura Sabino", role: "Divulgadora de Base", points: 390 }
];

export const POLITICIAN_CONTRADICTIONS: PoliticianContradiction[] = [
  {
    id: "p1",
    name: "Deputado Aurélio Da Silva",
    party: "PLB (Partido do Livre Bolso)",
    avatarColor: "bg-amber-400",
    publicClaim: "“O trabalhador é o patrimônio mais sagrado do país. Defendo a liberdade de produzir e a valorização irrestrita da nossa força de trabalho!”",
    realVotingRecord: "Votou a favor da PEC que permite a jornada diária de até 12 horas e votou contra o aumento real do salário mínimo sob 'risco fiscal'.",
    contradictionAnalysis: "O deputado defende a santidade do trabalhador nos palanques, mas na calada da noite no Congresso assina o papel que permite que sua jornada se estenda até o limite físico, vigiando o cofre contra um aumento real de poucos reais.",
    severity: "HIPOCRISIA GRAVE"
  },
  {
    id: "p2",
    name: "Deputada Drª Regina 'Verde' Sampaio",
    party: "PECO (Partido Eco-Ação)",
    avatarColor: "bg-emerald-400",
    publicClaim: "“A nossa bandeira é 100% verde! Transição ecológica Já e punição sem tréguas para indústrias poluidoras!”",
    realVotingRecord: "Aprovou subsídio de R$ 8,2 bilhões para instalação de termoelétricas movidas a óleo diesel venezuelano e votou pela flexibilização do código florestal para soja.",
    contradictionAnalysis: "Sua lapela exibe o broche de folha ecológica, mas sua caneta viabilizou o investimento bilionário que joga fumaça preta em combustivel fóssil altamente poluente. O lucro é preto, o discurso é verde.",
    severity: "ESTELIONATO ELEITORAL DE ELITE"
  },
  {
    id: "p3",
    name: "Vereador Beto 'Austeridade' Costa",
    party: "PMAC (Partido Menos Estado)",
    avatarColor: "bg-cyan-400",
    publicClaim: "“Chega de cabides de emprego! Devemos enxugar os luxos públicos e economizar cada centavo do cidadão pagador de impostos!”",
    realVotingRecord: "Aprovou em segundo turno a criação de 14 novos cargos comissionados com salário médio de R$ 12 mil e votou pelo reajuste de 33% nos repasses do auxílio-gabinete.",
    contradictionAnalysis: "A faca do corte orçamentário que ele prescreve para a merenda escolar e o posto de saúde local convenientemente some quando ele precisa de assessores e recursos para azeitamento de sua própria base eleitoral.",
    severity: "CONTRADIÇÃO LEVE"
  }
];
