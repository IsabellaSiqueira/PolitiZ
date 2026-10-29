/**
 * Projetos de lei de exemplo para o Voto às Cegas.
 * Autores e partidos são FICTÍCIOS. A interface sempre marca isso como exemplo ilustrativo.
 */
export type Tema = "Saúde" | "Educação" | "Transporte" | "Meio ambiente" | "Segurança" | "Trabalho" | "Cultura";

export type Lei = {
  numero: string;
  tema: Tema;
  ementa: string;
  resumo: string;
  autoria: string;
  partido: string;
};

export const leis: Lei[] = [
  {
    numero: "0418",
    tema: "Educação",
    ementa: "Educação financeira no ensino médio",
    resumo: "Inclui educação financeira como conteúdo obrigatório nas escolas públicas de ensino médio a partir do próximo ano letivo.",
    autoria: "Dep. Bruno Modelo",
    partido: "PQZ",
  },
  {
    numero: "0420",
    tema: "Transporte",
    ementa: "Passe livre para estudantes",
    resumo: "Garante transporte público gratuito para estudantes de escolas públicas em dias de aula, custeado por um fundo municipal.",
    autoria: "Dep. Carla Teste",
    partido: "PWK",
  },
  {
    numero: "0423",
    tema: "Saúde",
    ementa: "Postos de saúde abertos até as 22h",
    resumo: "Obriga as unidades básicas de saúde a funcionar em horário estendido nas cidades com mais de 100 mil habitantes.",
    autoria: "Dep. Ana Exemplo",
    partido: "PEX",
  },
  {
    numero: "0427",
    tema: "Meio ambiente",
    ementa: "Fim das sacolas plásticas descartáveis",
    resumo: "Proíbe a distribuição gratuita de sacolas plásticas descartáveis no comércio, com prazo de dois anos para adaptação.",
    autoria: "Sen. Diego Hipótese",
    partido: "PJV",
  },
  {
    numero: "0431",
    tema: "Segurança",
    ementa: "Câmeras corporais em todos os policiais",
    resumo: "Torna obrigatório o uso de câmeras corporais por policiais militares durante o patrulhamento, com gravação guardada por um ano.",
    autoria: "Dep. Elisa Amostra",
    partido: "PXY",
  },
  {
    numero: "0436",
    tema: "Trabalho",
    ementa: "Semana de quatro dias no serviço público",
    resumo: "Permite que órgãos públicos testem uma jornada de quatro dias por semana, sem redução de salário, por um período de dois anos.",
    autoria: "Dep. Fábio Caso",
    partido: "PQZ",
  },
  {
    numero: "0440",
    tema: "Cultura",
    ementa: "Meia-entrada para cursinho popular",
    resumo: "Estende o direito à meia-entrada em eventos culturais a estudantes matriculados em cursinhos populares pré-vestibular.",
    autoria: "Sen. Gabi Ensaio",
    partido: "PEX",
  },
  {
    numero: "0444",
    tema: "Saúde",
    ementa: "Psicólogo em todas as escolas",
    resumo: "Determina que toda escola pública com mais de 300 alunos tenha ao menos um psicólogo na equipe.",
    autoria: "Dep. Hugo Rascunho",
    partido: "PWK",
  },
  {
    numero: "0449",
    tema: "Transporte",
    ementa: "Ciclovias obrigatórias em avenidas novas",
    resumo: "Exige que toda avenida construída ou reformada com dinheiro federal inclua ciclovia separada dos carros.",
    autoria: "Dep. Iara Protótipo",
    partido: "PJV",
  },
  {
    numero: "0452",
    tema: "Educação",
    ementa: "Wi-fi gratuito nas escolas públicas",
    resumo: "Garante internet sem fio gratuita para alunos e professores em todas as escolas públicas, com velocidade mínima definida em regulamento.",
    autoria: "Sen. João Simulado",
    partido: "PXY",
  },
];
