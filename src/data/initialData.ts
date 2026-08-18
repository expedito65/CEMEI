import { Turma, Aluno, RegistroBuscaAtiva } from '../types';

export const INITIAL_TURMAS: Turma[] = [
  {
    id: 'turma-1',
    nome: 'Berçário II - Girassol',
    turno: 'Integral',
  },
  {
    id: 'turma-2',
    nome: 'Maternal I A - Estrelinhas',
    turno: 'Matutino',
  },
  {
    id: 'turma-3',
    nome: 'Maternal I B - Arco-Íris',
    turno: 'Vespertino',
  },
  {
    id: 'turma-4',
    nome: 'Maternal II A - Sementinhas',
    turno: 'Matutino',
  },
  {
    id: 'turma-5',
    nome: '1º Período A - Pequenos Notáveis',
    turno: 'Matutino',
  },
  {
    id: 'turma-6',
    nome: '2º Período B - Conquistadores',
    turno: 'Vespertino',
  },
];

export const INITIAL_ALUNOS: Aluno[] = [
  {
    id: 'aluno-1',
    nomeCompleto: 'Enzo Gabriel Pereira da Silva',
    turmaId: 'turma-2',
    turmaNome: 'Maternal I A - Estrelinhas',
    nomeResponsavel: 'Carla Cristina da Silva',
    telefoneResponsavel: '(31) 98765-4321',
    observacoes: 'Alergia a lactose'
  },
  {
    id: 'aluno-2',
    nomeCompleto: 'Sophia Helena Rodrigues Costa',
    turmaId: 'turma-4',
    turmaNome: 'Maternal II A - Sementinhas',
    nomeResponsavel: 'Marcos Vinícius Costa',
    telefoneResponsavel: '(31) 99123-8877',
    observacoes: ''
  },
  {
    id: 'aluno-3',
    nomeCompleto: 'Davi Lucas Alves Fernandes',
    turmaId: 'turma-5',
    turmaNome: '1º Período A - Pequenos Notáveis',
    nomeResponsavel: 'Renata Alves Fernandes',
    telefoneResponsavel: '(31) 98456-1122',
    observacoes: 'Reside com os avós maternos'
  },
  {
    id: 'aluno-4',
    nomeCompleto: 'Laura Beatriz Lima de Souza',
    turmaId: 'turma-1',
    turmaNome: 'Berçário II - Girassol',
    nomeResponsavel: 'Juliana Lima',
    telefoneResponsavel: '(31) 97334-9988',
    observacoes: ''
  },
  {
    id: 'aluno-5',
    nomeCompleto: 'Miguel Henrique de Freitas',
    turmaId: 'turma-3',
    turmaNome: 'Maternal I B - Arco-Íris',
    nomeResponsavel: 'Lucimara de Freitas',
    telefoneResponsavel: '(31) 98877-6655',
    observacoes: ''
  },
  {
    id: 'aluno-6',
    nomeCompleto: 'Alice Vitória Nascimento Guimarães',
    turmaId: 'turma-6',
    turmaNome: '2º Período B - Conquistadores',
    nomeResponsavel: 'Valéria Guimarães',
    telefoneResponsavel: '(31) 99654-3210',
    observacoes: ''
  }
];

export const INITIAL_REGISTROS: RegistroBuscaAtiva[] = [
  {
    id: 'reg-1',
    data: '2026-08-10',
    alunoId: 'aluno-1',
    nomeAluno: 'Enzo Gabriel Pereira da Silva',
    turmaId: 'turma-2',
    turma: 'Maternal I A - Estrelinhas',
    totalFaltas: 5,
    totalDiasAtestado: 0,
    totalDiasPerdaCargaHoraria: 5,
    descricao: 'Aluno ausente consecutivamente por 5 dias letivos no início do mês sem aviso prévio da família.',
    retornoBuscaAtiva: 'Contato telefônico realizado com a mãe Carla. Informou que a criança esteve com virose e comprometeu-se a levar o atestado e retornar as aulas na segunda-feira.',
    descricaoPortariaSemed: 'Portaria SEMED nº 012/2024 - Notificação e Busca Ativa após 3 faltas consecutivas ou 5 alternadas no mês',
    status: 'Resolvido - Aluno Retornou',
    registradoPor: 'Pedagoga Luciana Miranda',
    dataRetornoEfetivo: '2026-08-12',
    createdAt: '2026-08-10T09:30:00Z',
    updatedAt: '2026-08-12T14:20:00Z'
  },
  {
    id: 'reg-2',
    data: '2026-08-14',
    alunoId: 'aluno-3',
    nomeAluno: 'Davi Lucas Alves Fernandes',
    turmaId: 'turma-5',
    turma: '1º Período A - Pequenos Notáveis',
    totalFaltas: 8,
    totalDiasAtestado: 2,
    totalDiasPerdaCargaHoraria: 6,
    descricao: 'Acúmulo de ausências não justificadas às segundas e sextas-feiras, totalizando 6 dias de perda líquida de carga horária no bimestre.',
    retornoBuscaAtiva: 'Realizada ligação telefônica. Mãe relatou dificuldades de transporte devido à obra na via pública. Foi orientada sobre a obrigatoriedade da frequência e agendada reunião presencial.',
    descricaoPortariaSemed: 'Portaria SEMED nº 015/2024 - Acompanhamento de Infrequência com Perda de Carga Horária superior a 20%',
    status: 'Em Acompanhamento',
    registradoPor: 'Diretora Maria Aparecida',
    createdAt: '2026-08-14T11:15:00Z',
    updatedAt: '2026-08-14T11:15:00Z'
  },
  {
    id: 'reg-3',
    data: '2026-08-16',
    alunoId: 'aluno-5',
    nomeAluno: 'Miguel Henrique de Freitas',
    turmaId: 'turma-3',
    turma: 'Maternal I B - Arco-Íris',
    totalFaltas: 10,
    totalDiasAtestado: 0,
    totalDiasPerdaCargaHoraria: 10,
    descricao: 'Ausência prolongada há duas semanas sem atendimento às tentativas de contato telefônico pelo número cadastrado.',
    retornoBuscaAtiva: 'Equipe gestora e assistência social do CEMEI agendaram visita domiciliar para averiguação da situação familiar e garantia do direito à educação.',
    descricaoPortariaSemed: 'Portaria SEMED nº 024/2023 - Protocolo de Encaminhamento ao Conselho Tutelar e Rede de Proteção Social',
    status: 'Aguardando Visita Domiciliar',
    registradoPor: 'Assistente Social Roberta Vieira',
    createdAt: '2026-08-16T10:00:00Z',
    updatedAt: '2026-08-16T10:00:00Z'
  },
  {
    id: 'reg-4',
    data: '2026-08-17',
    alunoId: 'aluno-4',
    nomeAluno: 'Laura Beatriz Lima de Souza',
    turmaId: 'turma-1',
    turma: 'Berçário II - Girassol',
    totalFaltas: 4,
    totalDiasAtestado: 4,
    totalDiasPerdaCargaHoraria: 0,
    descricao: 'Criança acometida de bronquiolite, ausente por 4 dias com atestado médico entregue pela mãe.',
    retornoBuscaAtiva: 'Atestado médico de 4 dias devidamente arquivado no prontuário. Acompanhamento do quadro de saúde realizado pela coordenação.',
    descricaoPortariaSemed: 'Portaria SEMED nº 045/2024 - Regularização de Atestados Médicos e Afastamentos Prolongados',
    status: 'Resolvido - Aluno Retornou',
    registradoPor: 'Profª. Maria Clara Santos',
    dataRetornoEfetivo: '2026-08-18',
    createdAt: '2026-08-17T08:45:00Z',
    updatedAt: '2026-08-18T08:00:00Z'
  }
];

const STORAGE_KEYS = {
  TURMAS: 'cemei_turmas_v1',
  ALUNOS: 'cemei_alunos_v1',
  REGISTROS: 'cemei_registros_busca_ativa_v1',
  ESCOLA_INFO: 'cemei_escola_info_v1'
};

export interface EscolaInfo {
  nome: string;
  semedOrgao: string;
  inep?: string;
  anoLetivo: number;
  diretora?: string;
  pedagoga?: string;
  endereco?: string;
  telefone?: string;
}

export const INITIAL_ESCOLA_INFO: EscolaInfo = {
  nome: 'CEMEI Maria de Lourdes',
  semedOrgao: 'Secretaria Municipal de Educação - SEMED',
  inep: '31045892',
  anoLetivo: 2026,
  diretora: '',
  pedagoga: '',
  endereco: 'Rua Principal da Infância, nº 250 - Bairro das Flores',
  telefone: '(31) 3654-1234'
};

export const storage = {
  getTurmas: (): Turma[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TURMAS);
      return data ? JSON.parse(data) : INITIAL_TURMAS;
    } catch {
      return INITIAL_TURMAS;
    }
  },
  saveTurmas: (turmas: Turma[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TURMAS, JSON.stringify(turmas));
    } catch (e) {
      console.error('Erro ao salvar turmas no storage', e);
    }
  },

  getAlunos: (): Aluno[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALUNOS);
      return data ? JSON.parse(data) : INITIAL_ALUNOS;
    } catch {
      return INITIAL_ALUNOS;
    }
  },
  saveAlunos: (alunos: Aluno[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALUNOS, JSON.stringify(alunos));
    } catch (e) {
      console.error('Erro ao salvar alunos no storage', e);
    }
  },

  getRegistros: (): RegistroBuscaAtiva[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REGISTROS);
      return data ? JSON.parse(data) : INITIAL_REGISTROS;
    } catch {
      return INITIAL_REGISTROS;
    }
  },
  saveRegistros: (registros: RegistroBuscaAtiva[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(registros));
    } catch (e) {
      console.error('Erro ao salvar registros no storage', e);
    }
  },

  getEscolaInfo: (): EscolaInfo => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ESCOLA_INFO);
      return data ? JSON.parse(data) : INITIAL_ESCOLA_INFO;
    } catch {
      return INITIAL_ESCOLA_INFO;
    }
  },
  saveEscolaInfo: (info: EscolaInfo) => {
    try {
      localStorage.setItem(STORAGE_KEYS.ESCOLA_INFO, JSON.stringify(info));
    } catch (e) {
      console.error('Erro ao salvar info da escola', e);
    }
  },

  resetDefaults: () => {
    localStorage.setItem(STORAGE_KEYS.TURMAS, JSON.stringify(INITIAL_TURMAS));
    localStorage.setItem(STORAGE_KEYS.ALUNOS, JSON.stringify(INITIAL_ALUNOS));
    localStorage.setItem(STORAGE_KEYS.REGISTROS, JSON.stringify(INITIAL_REGISTROS));
    localStorage.setItem(STORAGE_KEYS.ESCOLA_INFO, JSON.stringify(INITIAL_ESCOLA_INFO));
  }
};
