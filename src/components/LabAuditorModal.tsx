/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ShieldAlert, Sparkles, AlertTriangle, FileText, ClipboardList, PenTool, CheckCircle, Flame } from 'lucide-react';
import { POLITICIAN_CONTRADICTIONS } from '../data';
import { PoliticianContradiction } from '../types';

interface LabAuditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGainPoints: (points: number) => void;
}

export const LabAuditorModal: React.FC<LabAuditorModalProps> = ({ isOpen, onClose, onGainPoints }) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  
  // Custom states
  const [customName, setCustomName] = useState('');
  const [customGroup, setCustomGroup] = useState('');
  const [customClaim, setCustomClaim] = useState('');
  const [customFact, setCustomFact] = useState('');
  
  // Audit Result State
  const [auditResult, setAuditResult] = useState<{
    name: string;
    party: string;
    claim: string;
    voting: string;
    analysis: string;
    severity: string;
    pointsAwarded: boolean;
  } | null>(null);

  const [auditHistory, setAuditHistory] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleSelectPreset = (id: string) => {
    setSelectedPresetId(id);
    const candidate = POLITICIAN_CONTRADICTIONS.find(item => item.id === id);
    if (candidate) {
      setAuditResult({
        name: candidate.name,
        party: candidate.party,
        claim: candidate.publicClaim,
        voting: candidate.realVotingRecord,
        analysis: candidate.contradictionAnalysis,
        severity: candidate.severity,
        pointsAwarded: false
      });
    }
  };

  const calculateCustomSeverity = (claim: string, fact: string) => {
    const lenSum = claim.length + fact.length;
    if (lenSum > 140) return 'ESTELIONATO ELEITORAL DE ELITE';
    if (lenSum > 80) return 'HIPOCRISIA GRAVE';
    return 'CONTRADIÇÃO LEVE';
  };

  const generateCustomAnalysis = (name: string, claimString: string, factString: string) => {
    // Generates a mock humorous, zine-style critical review
    const templates = [
      `No palanque, é tudo por nós. No painel de votação, é outra história: a prioridade real é o acerto com o lobby financeiro. Não é erro de percurso, é o método mesmo.`,
      `Discurso bonito, cheio de causa e emoção pra imprensa. Mas na hora do voto que mexe no bolso dos poderosos, a coragem some e sobra só desculpa técnica.`,
      `Usa a causa popular como decoração. Quando o holofote apaga e a ata do Diário Oficial fala mais alto, o discurso dá lugar aos privilégios de gabinete de sempre.`
    ];
    // Hash function based on name length
    const index = (name.length + claimString.length) % templates.length;
    return templates[index];
  };

  const handleRunCustomAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customClaim || !customFact) return;

    const severity = calculateCustomSeverity(customClaim, customFact);
    const analysis = generateCustomAnalysis(customName, customClaim, customFact);

    const result = {
      name: customName,
      party: customGroup || "Independente / Sem Partido",
      claim: `“${customClaim}”`,
      voting: customFact,
      analysis: analysis,
      severity: severity,
      pointsAwarded: true
    };

    setAuditResult(result);
    setAuditHistory([result, ...auditHistory]);
    
    // Reward points for auditing!
    onGainPoints(10);

    // Clear inputs
    setCustomName('');
    setCustomGroup('');
    setCustomClaim('');
    setCustomFact('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none overflow-y-auto">
      <div 
        className="w-full max-w-sm bg-white border-[3px] border-black p-5 relative my-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* REWARD OR TAG */}
        <div className="absolute top-2 left-2 bg-c-orange text-white border-2 border-black font-display font-black text-[9px] px-2 py-0.5 uppercase rotate-[-2deg] rounded-sm">
          LAB DESBLOQUEADO ✓
        </div>

        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 bg-black text-white hover:bg-c-orange border-2 border-black p-1 hover:text-white transition-colors cursor-pointer rounded-xl"
        >
          <X className="w-4 h-4 stroke-[3px]" />
        </button>

        {/* LOGO */}
        <div className="mt-8 text-center mb-4">
          <h2 className="font-display font-black text-2xl tracking-tighter uppercase text-c-orange leading-none mb-1">
            AUDITOR DE CONTRADIÇÕES
          </h2>
          <p className="font-display font-bold text-black text-[10px] uppercase tracking-widest bg-c-yellow inline-block px-2.5 py-1 border-2 border-black rotate-[1deg] rounded-md shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
            FERRAMENTA EXTRA OFICIAL DE INTELIGÊNCIA POPULAR
          </p>
        </div>

        {/* SELECTION TABS */}
        <div className="grid grid-cols-2 border-2 border-black font-display font-black text-xs mb-4 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => { setActiveTab('presets'); setAuditResult(null); }}
            className={`py-2 text-center border-r-2 border-black cursor-pointer transition-all ${activeTab === 'presets' ? 'bg-c-yellow text-black font-black' : 'bg-white text-black hover:bg-zinc-100 font-bold'}`}
          >
            ARQUIVOS PRONTOS
          </button>
          <button
            onClick={() => { setActiveTab('custom'); setAuditResult(null); }}
            className={`py-2 text-center cursor-pointer transition-all ${activeTab === 'custom' ? 'bg-c-yellow text-black font-black' : 'bg-white text-black hover:bg-zinc-100 font-bold'}`}
          >
            NOTÍCIA DO DIA (MANUAL)
          </button>
        </div>

        {/* TAB WORKSPACE */}
        {activeTab === 'presets' ? (
          <div className="space-y-3">
            <p className="font-sans font-medium text-[11px] text-zinc-600 leading-normal">
              Escolhe um político já catalogado no banco de contradições do Diário Oficial:
            </p>

            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {POLITICIAN_CONTRADICTIONS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p.id)}
                    className={`w-full text-left p-2.5 border-2 border-black font-display font-bold text-xs flex justify-between items-center transition-all cursor-pointer rounded-xl ${
                      isSelected ? 'bg-black text-c-yellow shadow-[2.5px_2.5px_0px_0px_rgba(240,83,31,1)]' : 'bg-white text-black hover:bg-c-yellow/20'
                    }`}
                  >
                    <div>
                      <span className="block uppercase leading-none font-black">{p.name}</span>
                      <span className="text-[10px] font-sans font-medium text-zinc-500">{p.party}</span>
                    </div>
                    {isSelected && <span className="text-[10px] bg-c-orange text-white px-2 py-0.5 font-bold uppercase rounded-md ml-2 shrink-0">Ativo</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* MANUAL CUSTOM ENTRY */
          <form onSubmit={handleRunCustomAudit} className="space-y-3">
            <p className="font-sans font-medium text-[11px] text-zinc-600 leading-normal">
              Viu um político mentindo ao vivo? Bota as informações aqui embaixo e cruza com o que tá nas atas oficiais!
            </p>

            <div>
              <label className="block font-display font-black text-[10px] uppercase text-black mb-1">Nome do Político</label>
              <input
                type="text"
                placeholder="Ex: Deputado João Da Verdade"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
                className="w-full bg-white border-2 border-black p-2.5 font-sans font-medium text-xs focus:bg-c-yellow/15 outline-none placeholder-zinc-400 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-display font-black text-[10px] uppercase text-black mb-1">Partido / Grupo</label>
              <input
                type="text"
                placeholder="Ex: PNB (Partido do Novo Brasil)"
                value={customGroup}
                onChange={(e) => setCustomGroup(e.target.value)}
                className="w-full bg-white border-2 border-black p-2.5 font-sans font-medium text-xs focus:bg-c-yellow/15 outline-none placeholder-zinc-400 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-display font-black text-[10px] uppercase text-black mb-1">Discurso Público (A Mentira)</label>
              <textarea
                placeholder="Ex: 'Defendo os servidores públicos acima de tudo!'"
                value={customClaim}
                onChange={(e) => setCustomClaim(e.target.value)}
                required
                rows={2}
                className="w-full bg-white border-2 border-black p-2.5 font-sans font-medium text-xs focus:bg-c-yellow/15 outline-none placeholder-zinc-400 resize-none rounded-xl"
              />
            </div>

            <div>
              <label className="block font-display font-black text-[10px] uppercase text-black mb-1">Fato do Diário Oficial (A Verdade)</label>
              <textarea
                placeholder="Ex: Votou a favor do congelamento dos salários da enfermagem por 10 anos."
                value={customFact}
                onChange={(e) => setCustomFact(e.target.value)}
                required
                rows={2}
                className="w-full bg-white border-2 border-black p-2.5 font-sans font-medium text-xs focus:bg-c-yellow/15 outline-none placeholder-zinc-400 resize-none rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white hover:bg-c-orange transition-colors border-2 border-black py-3 font-display font-black text-xs text-center uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(255,204,74,1)] cursor-pointer rounded-full"
            >
              CORTAR DISCURSO COM FATOS ➜
            </button>
          </form>
        )}

        {/* AUDIT OUTPUT DISPLAY AREA */}
        {auditResult && (
          <div className="mt-5 border-[3px] border-black bg-white p-4 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-4 duration-300 rounded-2xl">
            
            {/* NOISE STAMP */}
            <div className={`absolute -top-3.5 -right-2 text-white border-2 border-black font-display font-black text-[8px] px-2 py-0.5 tracking-tighter uppercase rotate-[8deg] z-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-md ${
              auditResult.severity === 'CONTRADIÇÃO LEVE' ? 'bg-c-teal' :
              auditResult.severity === 'HIPOCRISIA GRAVE' ? 'bg-c-orange' : 'bg-black'
            }`}>
              {auditResult.severity}
            </div>

            {/* AUDIT META */}
            <div className="border-b-2 border-dashed border-black pb-2 mb-2">
              <span className="font-display font-black text-[10px] uppercase text-zinc-500 block leading-none">PRONTUÁRIO GERADO</span>
              <h3 className="font-display font-black text-lg text-black uppercase tracking-tight mt-1 leading-none">
                {auditResult.name}
              </h3>
              <span className="text-[9px] font-mono bg-zinc-100 border border-black px-1.5 py-0.5 rounded-sm font-bold uppercase inline-block mt-1">{auditResult.party}</span>
            </div>

            {/* THE CLASH OF DISCOURSE VS TRUTH */}
            <div className="space-y-2.5 mb-3">
              <div>
                <p className="font-display font-black text-[9px] text-c-yellow bg-black px-1.5 inline-block py-0.5 uppercase rounded-sm">O PAPO:</p>
                <p className="font-sans italic text-xs font-semibold text-zinc-650 pl-2 border-l border-black/40 mt-1 leading-relaxed">
                  {auditResult.claim}
                </p>
              </div>

              <div>
                <p className="font-display font-black text-[9px] text-white bg-c-orange px-1.5 inline-block py-0.5 uppercase rounded-sm">O VOTO REAL (DIÁRIO OFICIAL):</p>
                <p className="font-sans text-xs font-bold text-black pl-2 border-l border-c-orange mt-1 leading-normal">
                  {auditResult.voting}
                </p>
              </div>
            </div>

            {/* PUNCHY ANARCHIST ANALYSIS */}
            <div className="bg-white border-2 border-dashed border-black p-3 rounded-xl">
              <p className="font-display font-black text-[9px] text-black tracking-widest uppercase mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-c-orange" /> ANÁLISE DO LABORATÓRIO:
              </p>
              <p className="font-sans font-medium text-[11px] text-zinc-800 leading-normal">
                {auditResult.analysis}
              </p>
            </div>

            {auditResult.pointsAwarded && (
              <div className="mt-3 bg-amber-100 border border-amber-400 p-2 text-center font-display font-black text-[10px] uppercase text-amber-800 tracking-wider rounded-xl">
                ✧ +10 PONTOS CRÍTICOS DE AGITADOR OBTIDOS!
              </div>
            )}
          </div>
        )}

        {/* AUDIT ACTION */}
        <div className="mt-5 pt-3 border-t-2 border-black/30">
          <button
            onClick={onClose}
            className="w-full bg-zinc-200 hover:bg-black hover:text-white transition-colors text-black font-display font-black text-[10px] py-2.5 border-2 border-black uppercase tracking-wider cursor-pointer rounded-xl"
          >
            FECHAR LABORATÓRIO E VOLTAR AO MAPA
          </button>
        </div>

      </div>
    </div>
  );
};
