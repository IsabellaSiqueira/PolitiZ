/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Cor fixa por categoria de PL — a cor funciona como sinalização, repetida
// em toda menção àquele tema, não escolhida aleatoriamente por elemento.
export const TEMA_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  'Liberdade & Redes': { bg: 'bg-c-orange', text: 'text-white', dot: '#F0531F' },
  'Economia': { bg: 'bg-c-yellow', text: 'text-black', dot: '#FFCC4A' },
  'Direitos Humanos': { bg: 'bg-c-lilac', text: 'text-black', dot: '#C4ACFA' },
  'Saúde': { bg: 'bg-c-teal', text: 'text-white', dot: '#00A2AB' },
  'Segurança Pública': { bg: 'bg-c-pink', text: 'text-black', dot: '#FF78A5' },
};

const FALLBACK = { bg: 'bg-c-yellow', text: 'text-black', dot: '#FFCC4A' };

export function getTemaColor(tema: string) {
  return TEMA_COLORS[tema] ?? FALLBACK;
}
