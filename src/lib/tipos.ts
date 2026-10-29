/** O que o celular recebe antes do voto: nada que identifique quem propôs. */
export type LeiCartao = {
  id: string;
  /** ex.: "PL 1234/2026" */
  rotulo: string;
  tema: string | null;
  ementa: string;
  resumo: string | null;
};

/** O que só é buscado depois do voto. */
export type Autoria = {
  autoria: string;
  /** sigla e UF atuais do autor, quando é deputado */
  partido: string | null;
  coautores: number;
  fonte: "camara" | "exemplo";
  link: string | null;
};
