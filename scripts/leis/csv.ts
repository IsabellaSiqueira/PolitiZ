// CSV simples (vírgula, aspas duplas), para a equipe abrir no Google Planilhas ou no Excel.

export function escreverCsv(cabecalho: string[], linhas: (string | number | null | undefined)[][]) {
  const celula = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  return [cabecalho, ...linhas].map((l) => l.map(celula).join(",")).join("\n") + "\n";
}

export function lerCsv(texto: string): Record<string, string>[] {
  const linhas: string[][] = [];
  let linha: string[] = [];
  let celula = "";
  let aspas = false;
  const t = texto.replace(/^﻿/, "");
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (aspas) {
      if (ch === '"' && t[i + 1] === '"') {
        celula += '"';
        i++;
      } else if (ch === '"') aspas = false;
      else celula += ch;
    } else if (ch === '"') aspas = true;
    else if (ch === ",") {
      linha.push(celula);
      celula = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && t[i + 1] === "\n") i++;
      linha.push(celula);
      linhas.push(linha);
      linha = [];
      celula = "";
    } else celula += ch;
  }
  if (celula || linha.length) {
    linha.push(celula);
    linhas.push(linha);
  }
  const [cab, ...resto] = linhas.filter((l) => l.some((c) => c.trim()));
  return (resto ?? []).map((l) => Object.fromEntries(cab.map((c, i) => [c.trim(), (l[i] ?? "").trim()])));
}
