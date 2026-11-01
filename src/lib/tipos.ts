/** O que o celular recebe antes do voto: nada que identifique quem propôs. */
export type LeiCartao = {
  id: string;
  /** ex.: "PL 1234/2026" */
  rotulo: string;
  tema: string | null;
  ementa: string;
  resumo: string | null;
};

/** Contexto da lei escrito pela equipe (tela D9 do protótipo), mostrado depois da decisão. */
export type Contexto = {
  problema: string | null;
  muda: string | null;
  afetados: string | null;
  /** sempre os dois lados: a favor e contra */
  argumentos: string | null;
  situacao: string | null;
};

/** O que só é buscado depois do voto. */
export type Autoria = {
  autoria: string;
  /** sigla e UF atuais do autor, quando é deputado */
  partido: string | null;
  coautores: number;
  fonte: "camara" | "exemplo";
  link: string | null;
  /** página do autor no portal oficial, para "Ver votações de ..." (Y10) */
  linkAutor: string | null;
  contexto: Contexto | null;
};

/** Opção da pergunta da TRC no fim da sessão (Y11). */
export type OpcaoTrc = { id: number; texto: string; intencao: boolean };
