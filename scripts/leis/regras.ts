// Regras do critério de seleção das leis (docs/criterio-leis.md).
// Mudar um número aqui muda o critério público: atualize também o documento e a página /criterio.

export type Regras = {
  /** leis por lote (o tamanho de uma sessão do Voto às Cegas) */
  tamanho: number;
  /** projetos apresentados nos últimos N meses */
  mesesJanela: number;
  maxPorPartido: number;
  minPartidos: number;
  minPorCasa: { camara: number; senado: number };
  minRegioes: number;
  maxPorTema: number;
  minTemas: number;
  /** leis com tema ligado à vida do estudante */
  minEstudante: number;
  /** temas (nomes da classificação da Câmara) que contam como ligados à vida do estudante */
  temasEstudante: string[];
  /** quantas vezes o sorteio tenta montar um lote que cumpra todas as cotas */
  maxTentativas: number;
};

export const REGRAS: Regras = {
  tamanho: 15,
  mesesJanela: 24,
  maxPorPartido: 2,
  minPartidos: 8,
  minPorCasa: { camara: 4, senado: 4 },
  minRegioes: 4,
  maxPorTema: 3,
  minTemas: 5,
  minEstudante: 5,
  // A CONFERIR com os nomes reais da classificação de temas da Câmara na primeira busca
  temasEstudante: [
    "Educação",
    "Trabalho e Emprego",
    "Viação, Transporte e Mobilidade",
    "Comunicações",
    "Esporte e Lazer",
    "Saúde",
    "Ciência, Tecnologia e Inovação",
    "Cultura",
  ],
  maxTentativas: 500,
};

export const REGIOES: Record<string, string> = {
  AC: "Norte", AP: "Norte", AM: "Norte", PA: "Norte", RO: "Norte", RR: "Norte", TO: "Norte",
  AL: "Nordeste", BA: "Nordeste", CE: "Nordeste", MA: "Nordeste", PB: "Nordeste", PE: "Nordeste", PI: "Nordeste", RN: "Nordeste", SE: "Nordeste",
  DF: "Centro-Oeste", GO: "Centro-Oeste", MT: "Centro-Oeste", MS: "Centro-Oeste",
  ES: "Sudeste", MG: "Sudeste", RJ: "Sudeste", SP: "Sudeste",
  PR: "Sul", RS: "Sul", SC: "Sul",
};

/** Situações que tiram o projeto da lista: arquivado ou já transformado em lei. */
export const SITUACAO_FORA = /arquivad|transformad[oa] em (norma|lei)|norma jur[ií]dica|retirad[oa] pelo autor|prejudicad/i;

/**
 * Filtro automático de homenagens (seção 3, item 1 do critério). Só ajuda a equipe:
 * cada exclusão sai no registro do lote com o motivo, e a equipe confere.
 */
export const HOMENAGEM =
  /^(denomina|d[áa] (o )?nome|confere (o )?t[íi]tulo|inscreve o nome|institui o dia|institui a semana|institui o m[eê]s|declara .*patrono|declara .*capital nacional|declara .*patrim[ôo]nio)/i;
