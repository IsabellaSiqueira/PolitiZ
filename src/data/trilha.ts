export type Alternativa = { letra: "A" | "B" | "C" | "D"; texto: string };

export type Pergunta = {
  enunciado: string;
  alternativas: Alternativa[];
  correta: Alternativa["letra"];
  /** Explica o porquê, em linguagem de quem está começando do zero. */
  explicacao: string;
};

export type Aula = {
  id: string;
  numero: number;
  titulo: string;
  resumo: string;
  perguntas: Pergunta[];
};

export type Modulo = {
  numero: number;
  tema: string;
  titulo: string;
  descricao: string;
  aulas: Aula[];
};

const alt = (a: string, b: string, c: string, d: string): Alternativa[] => [
  { letra: "A", texto: a },
  { letra: "B", texto: b },
  { letra: "C", texto: c },
  { letra: "D", texto: d },
];

export const modulo: Modulo = {
  numero: 1,
  tema: "Os Três Poderes",
  titulo: "Quem manda em quê?",
  descricao:
    "Quem faz o quê entre Executivo, Legislativo e Judiciário, e por que isso importa no seu dia a dia.",
  aulas: [
    {
      id: "tres-poderes",
      numero: 1,
      titulo: "Os Três Poderes",
      resumo: "Executivo, Legislativo e Judiciário",
      perguntas: [
        {
          enunciado: "Quem administra o país e coloca as leis federais em prática?",
          alternativas: alt("O presidente da República", "O Senado", "O Supremo Tribunal Federal", "A Câmara dos Deputados"),
          correta: "A",
          explicacao:
            "O presidente comanda o Poder Executivo federal: administra o governo, os ministérios e executa as leis. Executar quer dizer colocar em prática.",
        },
        {
          enunciado: "Qual Poder resolve conflitos aplicando as leis a casos concretos?",
          alternativas: alt("O Executivo", "O Legislativo", "O Judiciário", "Nenhum deles"),
          correta: "C",
          explicacao:
            "O Judiciário, formado por juízes e tribunais, decide disputas com base nas leis. O STF é o tribunal mais alto e guarda a Constituição.",
        },
        {
          enunciado: "O Poder Legislativo federal é formado por:",
          alternativas: alt(
            "Câmara dos Deputados e STF",
            "Câmara dos Deputados e Senado Federal",
            "Presidência e ministérios",
            "Senado e governadores",
          ),
          correta: "B",
          explicacao:
            "Juntos, Câmara e Senado formam o Congresso Nacional. Por isso o sistema é chamado de bicameral: duas casas.",
        },
        {
          enunciado: "Por que o poder é dividido em três?",
          alternativas: alt(
            "Para cada um fiscalizar e limitar os outros",
            "Para o governo gastar menos",
            "Porque cada estado escolhe um Poder",
            "Para as eleições acontecerem em datas diferentes",
          ),
          correta: "A",
          explicacao:
            "A separação evita que uma só pessoa ou grupo concentre todo o poder. É o sistema de freios e contrapesos: cada Poder tem como frear o outro.",
        },
      ],
    },
    {
      id: "quem-faz-as-leis",
      numero: 2,
      titulo: "Quem faz as leis?",
      resumo: "Câmara, Senado e Câmara Municipal",
      perguntas: [
        {
          enunciado: "Quem cria e vota as leis que valem para todo o Brasil?",
          alternativas: alt("O Congresso Nacional", "A Prefeitura", "O Supremo Tribunal Federal", "Os governadores"),
          correta: "A",
          explicacao:
            "O Congresso Nacional, formado pela Câmara dos Deputados e pelo Senado, cria e vota as leis federais. Prefeituras cuidam do município, e o STF julga se as leis respeitam a Constituição.",
        },
        {
          enunciado: "Quantos deputados federais a Câmara tem?",
          alternativas: alt("81", "100", "513", "27"),
          correta: "C",
          explicacao:
            "São 513 deputados federais. Cada estado elege um número proporcional à sua população, com mínimo de 8 e máximo de 70.",
        },
        {
          enunciado: "Quantos senadores cada estado elege?",
          alternativas: alt("Depende da população", "3", "1", "8"),
          correta: "B",
          explicacao:
            "Todo estado e o Distrito Federal elegem 3 senadores, não importa o tamanho. São 81 no total. O Senado representa os estados por igual.",
        },
        {
          enunciado: "O Congresso aprovou um projeto de lei. O que acontece em seguida?",
          alternativas: alt(
            "Ele vira lei automaticamente",
            "O STF precisa aprovar",
            "Vai para o presidente sancionar ou vetar",
            "Passa por um plebiscito",
          ),
          correta: "C",
          explicacao:
            "Sancionar é concordar e transformar em lei. Vetar é recusar, no todo ou em parte. Se houver veto, o Congresso ainda pode derrubá-lo.",
        },
        {
          enunciado: "Quem faz as leis da sua cidade?",
          alternativas: alt("O Senado", "A Câmara Municipal", "O governador", "A Câmara dos Deputados"),
          correta: "B",
          explicacao:
            "Na cidade, quem faz as leis são os vereadores, reunidos na Câmara Municipal. O prefeito comanda o Executivo municipal.",
        },
      ],
    },
    {
      id: "municipio-estado-uniao",
      numero: 3,
      titulo: "Município, estado e União",
      resumo: "Quem cuida do quê",
      perguntas: [
        {
          enunciado: "Quem normalmente organiza os ônibus que circulam dentro de uma cidade?",
          alternativas: alt("A União", "O governo do estado", "A prefeitura", "O Senado"),
          correta: "C",
          explicacao:
            "O transporte coletivo municipal é responsabilidade da prefeitura. Linhas que ligam cidades diferentes costumam ficar com o estado.",
        },
        {
          enunciado: "Quem vota as leis estaduais?",
          alternativas: alt("A Assembleia Legislativa", "A Câmara Municipal", "O Congresso Nacional", "O Tribunal de Justiça"),
          correta: "A",
          explicacao:
            "Cada estado tem uma Assembleia Legislativa, formada por deputados estaduais. É o Legislativo do estado.",
        },
        {
          enunciado: "Quem comanda a Polícia Militar?",
          alternativas: alt("O prefeito", "O governador do estado", "O presidente", "O Senado"),
          correta: "B",
          explicacao:
            "A Polícia Militar é estadual e fica subordinada ao governador. A Polícia Federal, essa sim, é da União.",
        },
        {
          enunciado: "Quem pode criar a moeda do país, o real?",
          alternativas: alt("Cada estado", "Cada município", "A União", "Os bancos privados"),
          correta: "C",
          explicacao:
            "Emitir moeda é competência da União, exercida pelo Banco Central. União é o nome do governo federal como ente da federação.",
        },
      ],
    },
    {
      id: "como-uma-lei-nasce",
      numero: 4,
      titulo: "Como uma lei nasce",
      resumo: "Do projeto à sanção",
      perguntas: [
        {
          enunciado: "Quem pode apresentar um projeto de lei federal?",
          alternativas: alt(
            "Só deputados",
            "Só o presidente",
            "Parlamentares, o presidente e até cidadãos, por iniciativa popular",
            "Só os partidos políticos",
          ),
          correta: "C",
          explicacao:
            "A Constituição permite várias origens. Iniciativa popular é quando os próprios cidadãos propõem um projeto, juntando assinaturas.",
        },
        {
          enunciado: "Um projeto de iniciativa popular federal precisa de assinaturas de, no mínimo:",
          alternativas: alt("1% do eleitorado nacional", "10 mil pessoas", "Metade dos eleitores", "Um deputado"),
          correta: "A",
          explicacao:
            "São necessárias assinaturas de pelo menos 1% do eleitorado nacional, espalhadas por pelo menos cinco estados, com 0,3% dos eleitores de cada um.",
        },
        {
          enunciado: "Antes de ir à votação geral, um projeto costuma passar por:",
          alternativas: alt("Uma eleição", "Comissões temáticas", "O STF", "As prefeituras"),
          correta: "B",
          explicacao:
            "Comissões são grupos menores de parlamentares que estudam o projeto por tema, como saúde ou educação, e dão um parecer antes do plenário.",
        },
        {
          enunciado: "O presidente vetou um projeto. O Congresso ainda pode:",
          alternativas: alt(
            "Nada, o veto é definitivo",
            "Pedir ao STF que aprove",
            "Derrubar o veto em votação",
            "Refazer a eleição",
          ),
          correta: "C",
          explicacao:
            "Em sessão conjunta, deputados e senadores podem derrubar o veto com a maioria absoluta de cada casa. Aí o texto vira lei mesmo sem a sanção.",
        },
      ],
    },
  ],
};
