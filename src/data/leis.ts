import type { Autoria, Contexto, LeiCartao } from "@/lib/tipos";
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
  /** contexto da lei (tela D9 do protótipo), também fictício */
  contexto?: Contexto;
};

export const leis: Lei[] = [
  {
    numero: "0418",
    tema: "Educação",
    ementa: "Educação financeira no ensino médio",
    resumo: "Inclui educação financeira como conteúdo obrigatório nas escolas públicas de ensino médio a partir do próximo ano letivo.",
    autoria: "Dep. Bruno Modelo",
    partido: "PQZ",
    contexto: {
      problema: "Muita gente termina a escola sem saber fazer um orçamento ou entender juros.",
      muda: "As escolas públicas de ensino médio passariam a ter educação financeira como conteúdo obrigatório.",
      afetados: "Estudantes, professores e as secretarias de educação, que teriam de preparar o material.",
      argumentos: "A favor: ajuda a evitar dívidas desde cedo. Contra: tira tempo de outras matérias.",
      situacao: "Esperando votação na Comissão de Educação da Câmara.",
    },
  },
  {
    numero: "0420",
    tema: "Transporte",
    ementa: "Passe livre para estudantes",
    resumo: "Garante transporte público gratuito para estudantes de escolas públicas em dias de aula, custeado por um fundo municipal.",
    autoria: "Dep. Carla Teste",
    partido: "PWK",
    contexto: {
      problema: "O custo da passagem faz alguns estudantes faltarem às aulas.",
      muda: "Estudantes de escolas públicas não pagariam ônibus em dias de aula.",
      afetados: "Estudantes e prefeituras, que bancariam o fundo que paga as passagens.",
      argumentos: "A favor: menos faltas e mais acesso à escola. Contra: custo alto para cidades com pouco dinheiro.",
      situacao: "Apresentado e ainda sem parecer de comissão.",
    },
  },
  {
    numero: "0423",
    tema: "Saúde",
    ementa: "Postos de saúde abertos até as 22h",
    resumo: "Obriga as unidades básicas de saúde a funcionar em horário estendido nas cidades com mais de 100 mil habitantes.",
    autoria: "Dep. Ana Exemplo",
    partido: "PEX",
    contexto: {
      problema: "Quem trabalha de dia quase nunca consegue chegar ao posto antes de ele fechar.",
      muda: "Postos de cidades com mais de 100 mil habitantes abririam até as 22h nos dias úteis.",
      afetados: "Quem usa o SUS, as equipes dos postos e as prefeituras, que pagariam boa parte do custo.",
      argumentos: "A favor: amplia o acesso de quem trabalha. Contra: custa caro para cidades com pouco dinheiro.",
      situacao: "Esperando votação na Comissão de Saúde da Câmara, o grupo de deputados que analisa o tema primeiro.",
    },
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
  {
    numero: "0455",
    tema: "Trabalho",
    ementa: "Primeiro emprego com desconto de impostos",
    resumo: "Reduz impostos para empresas que contratarem jovens de 16 a 24 anos sem experiência anterior com carteira assinada.",
    autoria: "Dep. Karla Esboço",
    partido: "PJV",
  },
  {
    numero: "0458",
    tema: "Meio ambiente",
    ementa: "Coleta seletiva obrigatória em todas as cidades",
    resumo: "Obriga todos os municípios a oferecer coleta seletiva de lixo reciclável em até cinco anos, com ajuda financeira da União.",
    autoria: "Dep. Leo Exercício",
    partido: "PEX",
  },
  {
    numero: "0461",
    tema: "Segurança",
    ementa: "Iluminação pública perto das escolas",
    resumo: "Determina que ruas num raio de 500 metros de escolas públicas tenham iluminação reforçada, custeada pelos municípios.",
    autoria: "Sen. Marta Modelo",
    partido: "PXY",
  },
  {
    numero: "0465",
    tema: "Cultura",
    ementa: "Biblioteca aberta aos fins de semana",
    resumo: "Obriga bibliotecas públicas municipais a abrir aos sábados e domingos em cidades com mais de 50 mil habitantes.",
    autoria: "Dep. Nina Rascunho",
    partido: "PQZ",
  },
  {
    numero: "0469",
    tema: "Saúde",
    ementa: "Absorvente gratuito nas escolas",
    resumo: "Garante a distribuição gratuita de absorventes higiênicos em todas as escolas públicas de ensino fundamental e médio.",
    autoria: "Dep. Otávio Caso",
    partido: "PWK",
  },
];

/* ---------- Adaptadores para o formato usado pela tela ---------- */

const PREFIXO = "ex-";

export const leisExemplo: LeiCartao[] = leis.map((l) => ({
  id: PREFIXO + l.numero,
  rotulo: `PL ${l.numero}`,
  tema: l.tema,
  ementa: l.ementa,
  resumo: l.resumo,
}));

export function ehExemplo(id: string) {
  return id.startsWith(PREFIXO);
}

export function autoriaExemplo(id: string): Autoria | null {
  const l = leis.find((x) => PREFIXO + x.numero === id);
  if (!l) return null;
  return { autoria: l.autoria, partido: l.partido, coautores: 0, fonte: "exemplo", link: null, linkAutor: null, contexto: l.contexto ?? null };
}
