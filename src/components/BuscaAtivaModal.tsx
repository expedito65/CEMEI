import React, { useState, useEffect } from 'react';
import { 
  RegistroBuscaAtiva, 
  Turma, 
  Aluno, 
  StatusBuscaAtiva,
  PORTARIAS_SEMED_PRESETS,
  RETORNOS_PRESETS
} from '../types';
import { 
  X, 
  Save, 
  Calendar, 
  User, 
  School, 
  FileText, 
  HelpCircle, 
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface BuscaAtivaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (registro: Omit<RegistroBuscaAtiva, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  registroEmEdicao?: RegistroBuscaAtiva | null;
  turmas: Turma[];
  alunos: Aluno[];
}

export const BuscaAtivaModal: React.FC<BuscaAtivaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  registroEmEdicao,
  turmas,
  alunos,
}) => {
  // Form State
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [alunoId, setAlunoId] = useState('');
  const [nomeAluno, setNomeAluno] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [turma, setTurma] = useState('');
  const [totalFaltas, setTotalFaltas] = useState<number | string>('');
  const [totalDiasAtestado, setTotalDiasAtestado] = useState<number | string>('');
  const [totalDiasPerdaCargaHoraria, setTotalDiasPerdaCargaHoraria] = useState<number | string>('');
  const [descricao, setDescricao] = useState('');
  const [retornoBuscaAtiva, setRetornoBuscaAtiva] = useState('');
  const [descricaoPortariaSemed, setDescricaoPortariaSemed] = useState('');
  const [status, setStatus] = useState<StatusBuscaAtiva>('Em Acompanhamento');
  const [registradoPor, setRegistradoPor] = useState('Equipe Pedagógica CEMEI');

  // Popula os campos quando o modal abre para edição ou novo
  useEffect(() => {
    if (registroEmEdicao) {
      setData(registroEmEdicao.data || new Date().toISOString().slice(0, 10));
      setAlunoId(registroEmEdicao.alunoId || '');
      setNomeAluno(registroEmEdicao.nomeAluno || '');
      setTurmaId(registroEmEdicao.turmaId || '');
      setTurma(registroEmEdicao.turma || '');
      setTotalFaltas(
        registroEmEdicao.totalFaltas !== undefined && registroEmEdicao.totalFaltas !== null 
          ? registroEmEdicao.totalFaltas 
          : ''
      );
      setTotalDiasAtestado(
        registroEmEdicao.totalDiasAtestado !== undefined && registroEmEdicao.totalDiasAtestado !== null 
          ? registroEmEdicao.totalDiasAtestado 
          : ''
      );
      setTotalDiasPerdaCargaHoraria(
        registroEmEdicao.totalDiasPerdaCargaHoraria !== undefined && registroEmEdicao.totalDiasPerdaCargaHoraria !== null 
          ? registroEmEdicao.totalDiasPerdaCargaHoraria 
          : ''
      );
      setDescricao(registroEmEdicao.descricao || '');
      setRetornoBuscaAtiva(registroEmEdicao.retornoBuscaAtiva || '');
      setDescricaoPortariaSemed(registroEmEdicao.descricaoPortariaSemed || '');
      setStatus(registroEmEdicao.status || 'Em Acompanhamento');
      setRegistradoPor(registroEmEdicao.registradoPor || 'Equipe Pedagógica CEMEI');
    } else {
      // Novo registro padrão
      setData(new Date().toISOString().slice(0, 10));
      setAlunoId('');
      setNomeAluno('');
      setTurmaId(turmas[0]?.id || '');
      setTurma(turmas[0]?.nome || '');
      setTotalFaltas('');
      setTotalDiasAtestado('');
      setTotalDiasPerdaCargaHoraria('');
      setDescricao('');
      setRetornoBuscaAtiva('');
      setDescricaoPortariaSemed('');
      setStatus('Em Acompanhamento');
      setRegistradoPor('Equipe Pedagógica CEMEI');
    }
  }, [registroEmEdicao, isOpen, turmas]);

  // Atualiza perda de carga horária automaticamente quando faltas e atestados mudam
  const handleFaltasChange = (valStr: string) => {
    setTotalFaltas(valStr);
    if (valStr !== '') {
      const faltasNum = Math.max(0, Number(valStr) || 0);
      const atestadoNum = totalDiasAtestado !== '' ? Math.max(0, Number(totalDiasAtestado) || 0) : 0;
      setTotalDiasPerdaCargaHoraria(Math.max(0, faltasNum - atestadoNum));
    }
  };

  const handleAtestadoChange = (valStr: string) => {
    setTotalDiasAtestado(valStr);
    if (totalFaltas !== '') {
      const faltasNum = Math.max(0, Number(totalFaltas) || 0);
      const atestadoNum = valStr !== '' ? Math.max(0, Number(valStr) || 0) : 0;
      setTotalDiasPerdaCargaHoraria(Math.max(0, faltasNum - atestadoNum));
    }
  };

  // Turma selection handler (cascades to filter students of this turma)
  const handleSelectTurma = (selectedTurmaNome: string) => {
    setTurma(selectedTurmaNome);
    const turmaObj = turmas.find(t => t.nome === selectedTurmaNome || t.id === selectedTurmaNome);
    if (turmaObj) {
      setTurmaId(turmaObj.id);
      setTurma(turmaObj.nome);
      // Check if currently selected student belongs to this new turma
      const alunoAtualNaNovaTurma = alunos.find(
        a => a.id === alunoId && (a.turmaId === turmaObj.id || a.turmaNome === turmaObj.nome)
      );
      if (!alunoAtualNaNovaTurma) {
        setAlunoId('');
        setNomeAluno('');
      }
    } else {
      setTurmaId('');
      setAlunoId('');
      setNomeAluno('');
    }
  };

  // Aluno selection handler
  const handleSelectAluno = (id: string) => {
    setAlunoId(id);
    if (!id || id === 'manual') {
      return;
    }
    const alunoEncontrado = alunos.find(a => a.id === id);
    if (alunoEncontrado) {
      setNomeAluno(alunoEncontrado.nomeCompleto);
      setTurmaId(alunoEncontrado.turmaId);
      setTurma(alunoEncontrado.turmaNome);
    }
  };

  // Alunos filtrados estritamente pela turma selecionada
  const alunosDaTurmaSelecionada = alunos.filter((a) => {
    if (!turma && !turmaId) return false;
    return (turmaId && a.turmaId === turmaId) || (turma && a.turmaNome.toLowerCase() === turma.toLowerCase());
  });

  const alunoSelecionadoObj = alunos.find(a => a.id === alunoId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeAluno.trim()) {
      alert('Por favor, informe o nome do aluno.');
      return;
    }
    if (!turma.trim()) {
      alert('Por favor, informe a turma do aluno.');
      return;
    }

    onSave({
      id: registroEmEdicao?.id,
      data,
      alunoId: alunoId || `aluno-temp-${Date.now()}`,
      nomeAluno: nomeAluno.trim(),
      turmaId: turmaId || `turma-temp-${Date.now()}`,
      turma: turma.trim(),
      totalFaltas: totalFaltas !== '' ? Number(totalFaltas) : undefined,
      totalDiasAtestado: totalDiasAtestado !== '' ? Number(totalDiasAtestado) : undefined,
      totalDiasPerdaCargaHoraria: totalDiasPerdaCargaHoraria !== '' ? Number(totalDiasPerdaCargaHoraria) : undefined,
      descricao: descricao.trim(),
      retornoBuscaAtiva: retornoBuscaAtiva.trim(),
      descricaoPortariaSemed: descricaoPortariaSemed.trim(),
      status,
      registradoPor: registradoPor.trim() || 'Equipe CEMEI Maria de Lourdes'
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-blue-700 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {registroEmEdicao ? 'Editar Registro de Busca Ativa' : 'Novo Registro de Busca Ativa'}
              </h2>
              <p className="text-xs text-blue-100">CEMEI Maria de Lourdes • Diretrizes SEMED</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          
          {/* Seção 1: Identificação Básica (Turma primeiro, depois Aluno) */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>1. Identificação do Aluno e Turma</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Campo: Data */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data do Registro *
                </label>
                <input
                  type="date"
                  required
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* 1º PASSO: Seleção da Turma */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                  <School className="w-3.5 h-3.5 text-blue-600" />
                  <span>1º Passo: Escolha a Turma *</span>
                </label>
                <select
                  required
                  value={turma}
                  onChange={(e) => handleSelectTurma(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-blue-200 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Selecione uma turma --</option>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.nome}>
                      {t.nome} ({t.turno})
                    </option>
                  ))}
                  <option value="Outra Turma">Outra Turma / Não listada...</option>
                </select>
              </div>
            </div>

            {/* 2º PASSO: Seleção do Aluno da Turma Escolhida */}
            <div className="pt-2 border-t border-slate-200/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Dropdown de Alunos da Turma */}
                <div>
                  <label className="block text-xs font-semibold text-blue-800 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>2º Passo: Selecione o Aluno da Turma *</span>
                    </span>
                    {turma && (
                      <span className="text-[10px] text-blue-600 font-normal">
                        {alunosDaTurmaSelecionada.length} aluno(s) nesta turma
                      </span>
                    )}
                  </label>
                  
                  <select
                    value={alunoId}
                    onChange={(e) => handleSelectAluno(e.target.value)}
                    disabled={!turma}
                    className={`w-full px-3 py-2 bg-white border rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      !turma ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'border-slate-300 text-slate-800'
                    }`}
                  >
                    {!turma ? (
                      <option value="">Selecione primeiro a turma acima</option>
                    ) : alunosDaTurmaSelecionada.length === 0 ? (
                      <option value="">Nenhum aluno cadastrado nesta turma (digite ao lado)</option>
                    ) : (
                      <>
                        <option value="">-- Selecione o aluno --</option>
                        {alunosDaTurmaSelecionada.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.nomeCompleto} {a.nomeResponsavel ? `(Resp: ${a.nomeResponsavel})` : ''}
                          </option>
                        ))}
                        <option value="manual">+ Digitar outro aluno manualmente...</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Campo de Texto: Nome do Aluno (Editável/Confirmável) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo do Aluno *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo do aluno(a)"
                    value={nomeAluno}
                    onChange={(e) => setNomeAluno(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Card com Informações do Aluno Selecionado */}
              {alunoSelecionadoObj && (
                <div className="bg-blue-50/70 border border-blue-100 p-2.5 rounded-lg text-xs text-blue-900 flex flex-wrap gap-x-4 gap-y-1 items-center">
                  <div>
                    <span className="font-semibold text-blue-800">Responsável:</span> {alunoSelecionadoObj.nomeResponsavel || 'Não informado'}
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">Contato:</span> {alunoSelecionadoObj.telefoneResponsavel}
                  </div>
                  {alunoSelecionadoObj.observacoes && (
                    <div className="w-full text-[11px] text-blue-700">
                      <span className="font-semibold">Obs:</span> {alunoSelecionadoObj.observacoes}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Seção 2: Frequência e Ausências (Faltas, Atestado, Perda de Carga Horária) - Optativos */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>2. Apuração de Frequência e Perda de Carga Horária</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">(Campos Optativos)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Campo: Total de Faltas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total de Faltas <span className="text-slate-400 font-normal">(Optativo)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={totalFaltas}
                    onChange={(e) => handleFaltasChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-rose-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">dias</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Ausências brutas registradas</p>
              </div>

              {/* Campo: Total de Dias de Atestado */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total de Dias de Atestado <span className="text-slate-400 font-normal">(Optativo)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={totalDiasAtestado}
                    onChange={(e) => handleAtestadoChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">dias</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Dias justificados por laudo</p>
              </div>

              {/* Campo: Total de Dias de Perda de Carga Horária */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Total de Dias de Perda <span className="text-slate-400 font-normal">(Optativo)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={totalDiasPerdaCargaHoraria}
                    onChange={(e) => setTotalDiasPerdaCargaHoraria(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 bg-amber-50/50 rounded-lg text-xs font-bold text-amber-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">dias</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Dias de perda de carga horária</p>
              </div>
            </div>

            {/* Indicador em tempo real de Infrequência Não Justificada */}
            {(totalFaltas !== '' || totalDiasAtestado !== '' || totalDiasPerdaCargaHoraria !== '') && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-900">
                  Infrequência Não Justificada (Faltas - Atestado - Perda C.H.):
                </span>
                <span className="text-xs font-bold text-emerald-950 px-2 py-0.5 bg-white border border-emerald-300 rounded shadow-2xs">
                  {Math.max(
                    0,
                    (Number(totalFaltas) || 0) -
                      (Number(totalDiasAtestado) || 0) -
                      (Number(totalDiasPerdaCargaHoraria) || 0)
                  )}{' '}
                  dias
                </span>
              </div>
            )}
          </div>

          {/* Seção 3: Descrição e Ocorrência - Opcional */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Descrição da Ocorrência / Motivo da Ausência <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <span className="text-[11px] text-slate-400">Detalhe o histórico pedagógico ou familiar</span>
            </div>
            <textarea
              rows={3}
              placeholder="Ex: Aluno ausente consecutivamente por dias letivos. Tentativas de contato telefônico ou histórico familiar..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Seção 4: Retorno da Busca Ativa - Opcional */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Retorno da Busca Ativa (Resultado / Encaminhamento) <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
            </div>
            
            {/* Sugestões rápidas de retorno */}
            <div className="mb-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    setRetornoBuscaAtiva(e.target.value);
                  }
                }}
                defaultValue=""
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Inserir texto predefinido de retorno da busca ativa --</option>
                {RETORNOS_PRESETS.map((ret, idx) => (
                  <option key={idx} value={ret}>
                    {ret}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              rows={2}
              placeholder="Descreva a resposta do responsável, visita realizada ou ação adotada (opcional)..."
              value={retornoBuscaAtiva}
              onChange={(e) => setRetornoBuscaAtiva(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Seção 5: Descrição da Portaria SEMED - Opcional */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Descrição da Portaria SEMED (Enquadramento Normativo) <span className="text-slate-400 font-normal">(Opcional)</span>
            </label>
            
            {/* Seletor rápido de portarias */}
            <select
              value={descricaoPortariaSemed}
              onChange={(e) => setDescricaoPortariaSemed(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Nenhuma portaria selecionada (Opcional) --</option>
              {PORTARIAS_SEMED_PRESETS.map((port, idx) => (
                <option key={idx} value={port}>
                  {port}
                </option>
              ))}
              <option value="Outra Portaria SEMED personalizada">Outra Portaria SEMED personalizada...</option>
            </select>

            {/* Campo de texto livre caso necessite complementar */}
            <input
              type="text"
              placeholder="Digite ou edite o texto da portaria SEMED (opcional)..."
              value={descricaoPortariaSemed}
              onChange={(e) => setDescricaoPortariaSemed(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none mt-1"
            />
          </div>

          {/* Seção 6: Status e Responsável pelo Registro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status da Busca Ativa
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusBuscaAtiva)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Em Acompanhamento">Em Acompanhamento</option>
                <option value="Resolvido - Aluno Retornou">Resolvido - Aluno Retornou</option>
                <option value="Aguardando Visita Domiciliar">Aguardando Visita Domiciliar</option>
                <option value="Encaminhado ao Conselho Tutelar">Encaminhado ao Conselho Tutelar</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Responsável pelo Registro
              </label>
              <input
                type="text"
                placeholder="Ex: Profª. Ana / Pedagoga Luciana"
                value={registradoPor}
                onChange={(e) => setRegistradoPor(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Rodapé / Botões */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{registroEmEdicao ? 'Salvar Alterações' : 'Cadastrar Busca Ativa'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
