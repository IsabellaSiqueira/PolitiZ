/**
 * Glossário (Y6). PROVISÓRIO, como as aulas: o texto final é da equipe de conteúdo e passa
 * pela revisão antes de chegar a alunos (no banco, só termo revisado é publicado).
 * Cada termo tem as formas em que aparece nos textos, para ser sublinhado onde estiver.
 */
export type Termo = { termo: string; definicao: string; variantes?: string[] };

export const glossario: Termo[] = [
  { termo: "Assembleia Legislativa", definicao: "O lugar onde os deputados estaduais fazem as leis de cada estado.", variantes: ["Assembleias Legislativas"] },
  { termo: "Bicameral", definicao: "Um Legislativo com duas casas. No Brasil, o Congresso tem a Câmara dos Deputados e o Senado Federal." },
  { termo: "Comissão", definicao: "Um grupo menor de parlamentares que estuda um assunto e dá um parecer sobre os projetos antes da votação geral.", variantes: ["comissões"] },
  { termo: "Congresso Nacional", definicao: "O Poder Legislativo do país. Tem duas casas: a Câmara dos Deputados e o Senado Federal." },
  { termo: "Constituição", definicao: "A lei mais importante do país. Diz como o Estado se organiza e quais são os direitos de todas as pessoas." },
  { termo: "Deputado federal", definicao: "Quem representa a população na Câmara dos Deputados. São 513, eleitos a cada quatro anos.", variantes: ["deputados federais", "deputados"] },
  { termo: "Ementa", definicao: "O resumo oficial de um projeto de lei, escrito pela própria Câmara ou pelo Senado." },
  { termo: "Federação", definicao: "Um país em que o poder é repartido entre o governo nacional, os estados e os municípios." },
  { termo: "Freios e contrapesos", definicao: "O jeito de cada Poder limitar os outros, para nenhum grupo concentrar todo o poder." },
  { termo: "Iniciativa popular", definicao: "Quando os próprios cidadãos apresentam um projeto de lei, juntando assinaturas de pelo menos 1% do eleitorado." },
  { termo: "Parecer", definicao: "A opinião por escrito que uma comissão dá sobre um projeto de lei." },
  { termo: "Plenário", definicao: "A votação geral, com todos os parlamentares da casa. Também é o nome do salão onde ela acontece." },
  { termo: "Poder Executivo", definicao: "O Poder que administra: cuida dos serviços públicos e coloca as leis em prática.", variantes: ["Executivo"] },
  { termo: "Poder Judiciário", definicao: "O Poder formado por juízes e tribunais, que resolve conflitos aplicando as leis.", variantes: ["Judiciário"] },
  { termo: "Poder Legislativo", definicao: "O Poder que faz as leis e fiscaliza o Executivo.", variantes: ["Legislativo"] },
  { termo: "Projeto de lei", definicao: "Uma proposta de lei nova, ou de mudança numa lei que já existe, que ainda está em discussão.", variantes: ["projetos de lei"] },
  { termo: "Sanção", definicao: "Quando o presidente concorda com um projeto aprovado e ele vira lei.", variantes: ["sancionar"] },
  { termo: "Senador", definicao: "Quem representa um estado no Senado Federal. São 81: três por estado e três pelo Distrito Federal.", variantes: ["senadores"] },
  { termo: "Tramitação", definicao: "O caminho de um projeto de lei, da apresentação até a votação final." },
  { termo: "União", definicao: "O governo federal: cuida dos assuntos do país inteiro, como a moeda e a defesa." },
  { termo: "Vereador", definicao: "Quem faz as leis da cidade, na Câmara Municipal.", variantes: ["vereadores"] },
  { termo: "Veto", definicao: "Quando o presidente recusa um projeto aprovado, no todo ou em parte. O Congresso pode derrubar o veto.", variantes: ["vetar"] },
];
