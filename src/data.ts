/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LessonNode, QuizQuestion, LeaderboardUser, Bill } from './types';

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

export const BILLS: Bill[] = [
  {
    id: 1,
    plNumber: "PL 2630/2020",
    casa: "Senado",
    tema: "Liberdade & Redes",
    resumoNeutro: "Regula redes sociais e serviços de mensagens: exige identificação de contas, cria mecanismos de checagem de conteúdo e responsabiliza plataformas por danos causados pela disseminação de desinformação.",
    autor: "Alessandro Vieira",
    fotoUrl: "https://legis.senado.leg.br/senadores/fotos-oficiais/5982",
    partido: "MDB",
    estado: "SE",
    curiosidade: "Aprovado no Senado em 2020, ainda espera votação na Câmara. Foi apresentado quando o autor ainda estava no Cidadania — hoje ele está no MDB.",
    fonteUrl: "https://www25.senado.leg.br/web/atividade/materias/-/materia/141944"
  },
  {
    id: 2,
    plNumber: "PLP 5/2026",
    casa: "Câmara",
    tema: "Economia",
    resumoNeutro: "Institui o Imposto sobre Grandes Fortunas (IGF), cobrando sobre patrimônio líquido acima de um valor mínimo definido em lei, já descontadas dívidas e ônus reais.",
    autor: "Pedro Uczai",
    fotoUrl: "https://www.camara.leg.br/internet/deputado/bandep/160604.jpg",
    partido: "PT",
    estado: "SC",
    curiosidade: "O IGF está previsto na Constituição desde 1988, mas nunca foi regulamentado — essa é mais uma tentativa entre várias ao longo de décadas.",
    fonteUrl: "https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2600263"
  },
  {
    id: 3,
    plNumber: "PL 717/2025",
    casa: "Câmara",
    tema: "Direitos Humanos",
    resumoNeutro: "Tipifica como crime qualquer conduta discriminatória, ofensiva, vexatória ou violenta contra pessoas trans e travestis, com pena de 2 a 4 anos de prisão (podendo aumentar em casos de violência física ou morte).",
    autor: "Max Lemos",
    fotoUrl: "https://www.camara.leg.br/internet/deputado/bandep/220607.jpg",
    partido: "UNIÃO",
    estado: "RJ",
    curiosidade: "A relatoria na comissão ficou com a deputada Erika Kokay (PT-DF) — parlamentares de partidos diferentes trabalhando juntos nesse tema.",
    fonteUrl: "https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2485614"
  },
  {
    id: 4,
    plNumber: "PL 2599/2026",
    casa: "Câmara",
    tema: "Saúde",
    resumoNeutro: "Inclui alerta sanitário obrigatório no rótulo de alimentos ultraprocessados e de produtos com adoçantes, além de aprimorar a rotulagem nutricional frontal (a \"lupa\" que já existe na embalagem).",
    autor: "Paulo Teixeira",
    fotoUrl: "https://www.camara.leg.br/internet/deputado/bandep/141488.jpg",
    partido: "PT",
    estado: "SP",
    curiosidade: "A \"lupa\" nos rótulos já é obrigatória desde 2022 — esse projeto quer ir além, com aviso específico pra ultraprocessados.",
    fonteUrl: "https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2627647"
  },
  {
    id: 5,
    plNumber: "PL 1936/2026",
    casa: "Câmara",
    tema: "Segurança Pública",
    resumoNeutro: "Reorganiza as regras de aquisição, posse e porte de arma de fogo no país e cria um novo Sistema Nacional de Registro de Armas de Fogo (SINRAF), revogando trechos do Estatuto do Desarmamento atual.",
    autor: "Capitão Alden",
    fotoUrl: "https://www.camara.leg.br/internet/deputado/bandep/220690.jpg",
    partido: "PL",
    estado: "BA",
    curiosidade: "O tema porte de armas divide o Congresso desde o Estatuto do Desarmamento de 2003 — o número de propostas sobre o assunto só cresce a cada legislatura.",
    fonteUrl: "https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2617803"
  }
];
