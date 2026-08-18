export interface Turma {
  id: string;
  nome: string; // Ex: "Berçário II", "Maternal I A", "1º Período B"
  turno: 'Matutino' | 'Vespertino' | 'Integral';
}

export interface Aluno {
  id: string;
  nomeCompleto: string;
  turmaId: string;
  turmaNome: string;
  nomeResponsavel?: string;
  telefoneResponsavel: string;
  observacoes?: string;
}

export type StatusBuscaAtiva = 
  | 'Pendente' 
  | 'Em Acompanhamento' 
  | 'Resolvido - Aluno Retornou' 
  | 'Encaminhado ao Conselho Tutelar' 
  | 'Aguardando Visita Domiciliar';

export interface RegistroBuscaAtiva {
  id: string;
  data: string; // YYYY-MM-DD
  alunoId: string;
  nomeAluno: string;
  turmaId: string;
  turma: string; // Nome da Turma
  totalFaltas?: number;
  totalDiasAtestado?: number;
  totalDiasPerdaCargaHoraria?: number;
  descricao?: string;
  retornoBuscaAtiva?: string;
  descricaoPortariaSemed?: string;
  status: StatusBuscaAtiva;
  registradoPor?: string;
  dataRetornoEfetivo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FiltrosBuscaAtiva {
  busca: string;
  turma: string;
  status: string;
  dataInicio: string;
  dataFim: string;
}

export const PORTARIAS_SEMED_PRESETS = [
  "Portaria SEMED nº 012/2024 - Notificação e Busca Ativa após 3 faltas consecutivas ou 5 alternadas no mês",
  "Portaria SEMED nº 015/2024 - Acompanhamento de Infrequência com Perda de Carga Horária superior a 20%",
  "Portaria SEMED nº 024/2023 - Protocolo de Encaminhamento ao Conselho Tutelar e Rede de Proteção Social",
  "Portaria SEMED nº 033/2024 - Acompanhamento Especial da Educação Infantil (Berçário e Maternal)",
  "Portaria SEMED nº 045/2024 - Regularização de Atestados Médicos e Afastamentos Prolongados",
  "Resolução CME/SEMED - Diretrizes de Permanência e Evasão Escolar na Primeira Infância"
];

export const RETORNOS_PRESETS = [
  "Contato telefônico realizado com o responsável - Informou que o aluno retornará na próxima semana.",
  "Visita domiciliar realizada pela equipe pedagógica - Família acolhida e orientada sobre a importância da frequência.",
  "Responsável compareceu ao CEMEI e apresentou justificativa / atestado médico.",
  "Aluno retornou regularmente às atividades escolares.",
  "Responsável notificado formalmente por meio de termo de ciência e compromisso.",
  "Sem sucesso no contato telefônico e endereço desatualizado - Encaminhado para visita emergencial.",
  "Encaminhamento protocolado junto ao Conselho Tutelar / CRAS da região.",
  "Família comunicou mudança de endereço / solicitação de transferência para outra unidade."
];
