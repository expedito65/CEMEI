import React, { useState } from 'react';
import { Turma, Aluno, RegistroBuscaAtiva } from '../types';
import { 
  Users, 
  School, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Phone, 
  MapPin, 
  UserCheck, 
  ClipboardList, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';

interface TurmasAlunosManagerProps {
  turmas: Turma[];
  alunos: Aluno[];
  registros: RegistroBuscaAtiva[];
  onSalvarTurma: (turma: Turma) => void;
  onExcluirTurma: (id: string) => void;
  onSalvarAluno: (aluno: Aluno) => void;
  onExcluirAluno: (id: string) => void;
  onIniciarBuscaAtivaParaAluno: (aluno: Aluno) => void;
}

export const TurmasAlunosManager: React.FC<TurmasAlunosManagerProps> = ({
  turmas,
  alunos,
  registros,
  onSalvarTurma,
  onExcluirTurma,
  onSalvarAluno,
  onExcluirAluno,
  onIniciarBuscaAtivaParaAluno,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'alunos' | 'turmas'>('alunos');
  const [filtroTurma, setFiltroTurma] = useState<string>('');
  const [buscaAluno, setBuscaAluno] = useState<string>('');

  // Estados para Modal/Form de Aluno
  const [modalAlunoAberto, setModalAlunoAberto] = useState(false);
  const [alunoEmEdicao, setAlunoEmEdicao] = useState<Aluno | null>(null);
  const [formAlunoNome, setFormAlunoNome] = useState('');
  const [formAlunoTurmaId, setFormAlunoTurmaId] = useState('');
  const [formAlunoResponsavel, setFormAlunoResponsavel] = useState('');
  const [formAlunoTelefone, setFormAlunoTelefone] = useState('');
  const [formAlunoObs, setFormAlunoObs] = useState('');

  // Estados para Modal/Form de Turma
  const [modalTurmaAberto, setModalTurmaAberto] = useState(false);
  const [turmaEmEdicao, setTurmaEmEdicao] = useState<Turma | null>(null);
  const [formTurmaNome, setFormTurmaNome] = useState('');
  const [formTurmaTurno, setFormTurmaTurno] = useState<Turma['turno']>('Matutino');

  // Filtragem de alunos
  const alunosFiltrados = alunos.filter((aluno) => {
    const matchBusca = 
      buscaAluno === '' ||
      aluno.nomeCompleto.toLowerCase().includes(buscaAluno.toLowerCase()) ||
      aluno.nomeResponsavel.toLowerCase().includes(buscaAluno.toLowerCase()) ||
      aluno.turmaNome.toLowerCase().includes(buscaAluno.toLowerCase());

    const matchTurma = filtroTurma === '' || aluno.turmaId === filtroTurma;

    return matchBusca && matchTurma;
  });

  // Abertura do formulário de aluno
  const handleAbrirNovoAluno = () => {
    setAlunoEmEdicao(null);
    setFormAlunoNome('');
    setFormAlunoTurmaId(turmas[0]?.id || '');
    setFormAlunoResponsavel('');
    setFormAlunoTelefone('');
    setFormAlunoObs('');
    setModalAlunoAberto(true);
  };

  const handleAbrirEditarAluno = (aluno: Aluno) => {
    setAlunoEmEdicao(aluno);
    setFormAlunoNome(aluno.nomeCompleto);
    setFormAlunoTurmaId(aluno.turmaId);
    setFormAlunoResponsavel(aluno.nomeResponsavel);
    setFormAlunoTelefone(aluno.telefoneResponsavel);
    setFormAlunoObs(aluno.observacoes || '');
    setModalAlunoAberto(true);
  };

  const handleSalvarAlunoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAlunoNome.trim()) {
      alert('Informe o nome do aluno.');
      return;
    }
    const turmaSelecionada = turmas.find(t => t.id === formAlunoTurmaId);
    const turmaNome = turmaSelecionada ? turmaSelecionada.nome : 'Sem Turma';

    const novoAluno: Aluno = {
      id: alunoEmEdicao ? alunoEmEdicao.id : `aluno-${Date.now()}`,
      nomeCompleto: formAlunoNome.trim(),
      turmaId: formAlunoTurmaId,
      turmaNome: turmaNome,
      nomeResponsavel: formAlunoResponsavel.trim(),
      telefoneResponsavel: formAlunoTelefone.trim() || 'Sem telefone',
      observacoes: formAlunoObs.trim()
    };

    onSalvarAluno(novoAluno);
    setModalAlunoAberto(false);
  };

  // Abertura do formulário de turma
  const handleAbrirNovaTurma = () => {
    setTurmaEmEdicao(null);
    setFormTurmaNome('');
    setFormTurmaTurno('Matutino');
    setModalTurmaAberto(true);
  };

  const handleAbrirEditarTurma = (turma: Turma) => {
    setTurmaEmEdicao(turma);
    setFormTurmaNome(turma.nome);
    setFormTurmaTurno(turma.turno);
    setModalTurmaAberto(true);
  };

  const handleSalvarTurmaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTurmaNome.trim()) {
      alert('Informe o nome da turma.');
      return;
    }

    const novaTurma: Turma = {
      id: turmaEmEdicao ? turmaEmEdicao.id : `turma-${Date.now()}`,
      nome: formTurmaNome.trim(),
      turno: formTurmaTurno,
    };

    onSalvarTurma(novaTurma);
    setModalTurmaAberto(false);
  };

  // Contagem de buscas ativas por aluno
  const getBuscasCountAluno = (alunoId: string, alunoNome: string) => {
    return registros.filter(r => r.alunoId === alunoId || r.nomeAluno.toLowerCase() === alunoNome.toLowerCase()).length;
  };

  return (
    <div id="turmas-alunos-section" className="space-y-6">
      
      {/* Sub-Tabs de Alternância */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('alunos')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'alunos'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Alunos do CEMEI ({alunos.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('turmas')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
              activeSubTab === 'turmas'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Turmas Cadastradas ({turmas.length})</span>
          </button>
        </div>

        {activeSubTab === 'alunos' ? (
          <button
            id="btn-cadastrar-aluno"
            onClick={handleAbrirNovoAluno}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Aluno</span>
          </button>
        ) : (
          <button
            id="btn-cadastrar-turma"
            onClick={handleAbrirNovaTurma}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Turma</span>
          </button>
        )}
      </div>

      {/* Visão de Alunos */}
      {activeSubTab === 'alunos' && (
        <div className="space-y-4">
          
          {/* Barra de Filtros para Alunos */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por aluno ou responsável..."
                value={buscaAluno}
                onChange={(e) => setBuscaAluno(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Turma:</span>
              <select
                value={filtroTurma}
                onChange={(e) => setFiltroTurma(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as Turmas</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} ({t.turno})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabela de Alunos */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-3">Nome do Aluno</th>
                    <th className="py-3 px-3">Turma</th>
                    <th className="py-3 px-3">Nome do Responsável</th>
                    <th className="py-3 px-3">Telefone</th>
                    <th className="py-3 px-3">Observações</th>
                    <th className="py-3 px-2 text-center">Buscas Ativas</th>
                    <th className="py-3 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {alunosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Nenhum aluno encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    alunosFiltrados.map((aluno) => {
                      const totalBuscas = getBuscasCountAluno(aluno.id, aluno.nomeCompleto);
                      return (
                        <tr key={aluno.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {aluno.nomeCompleto}
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-800">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
                              {aluno.turmaNome}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-700 font-medium">
                            {aluno.nomeResponsavel || '—'}
                          </td>
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{aluno.telefoneResponsavel}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                            {aluno.observacoes || '—'}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded text-xs ${
                              totalBuscas > 0 ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {totalBuscas} {totalBuscas === 1 ? 'registro' : 'registros'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => onIniciarBuscaAtivaParaAluno(aluno)}
                                title="Registrar Busca Ativa para este aluno"
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                              >
                                <ClipboardList className="w-3.5 h-3.5" />
                                <span>Busca Ativa</span>
                              </button>
                              <button
                                onClick={() => handleAbrirEditarAluno(aluno)}
                                title="Editar cadastro do aluno"
                                className="p-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Deseja remover o cadastro do aluno "${aluno.nomeCompleto}"?`)) {
                                    onExcluirAluno(aluno.id);
                                  }
                                }}
                                title="Excluir aluno"
                                className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Visão de Turmas */}
      {activeSubTab === 'turmas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {turmas.map((turma) => {
            const alunosNaTurma = alunos.filter(a => a.turmaId === turma.id || a.turmaNome === turma.nome);
            const buscasNaTurma = registros.filter(r => r.turmaId === turma.id || r.turma === turma.nome);

            return (
              <div 
                key={turma.id} 
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100 uppercase tracking-wide">
                        Turno: {turma.turno}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-2.5">{turma.nome}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAbrirEditarTurma(turma)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Editar Turma"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Deseja excluir a turma "${turma.nome}"?`)) {
                            onExcluirTurma(turma.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Excluir Turma"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-slate-500 font-medium block">Alunos</span>
                    <span className="text-base font-bold text-slate-800">{alunosNaTurma.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block">Buscas Ativas</span>
                    <span className="text-base font-bold text-rose-700">{buscasNaTurma.length}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Cadastro / Edição de Aluno */}
      {modalAlunoAberto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {alunoEmEdicao ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}
              </h3>
              <button onClick={() => setModalAlunoAberto(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarAlunoSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Aluno *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo do aluno(a)"
                  value={formAlunoNome}
                  onChange={(e) => setFormAlunoNome(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Turma *</label>
                <select
                  required
                  value={formAlunoTurmaId}
                  onChange={(e) => setFormAlunoTurmaId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma turma...</option>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome} ({t.turno})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Responsável <span className="text-slate-400 font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Mãe / Pai / Guardião (opcional)"
                    value={formAlunoResponsavel}
                    onChange={(e) => setFormAlunoResponsavel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone *</label>
                  <input
                    type="text"
                    required
                    placeholder="(31) 99999-9999"
                    value={formAlunoTelefone}
                    onChange={(e) => setFormAlunoTelefone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais relevantes..."
                  value={formAlunoObs}
                  onChange={(e) => setFormAlunoObs(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-normal text-slate-900 focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalAlunoAberto(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Salvar Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cadastro / Edição de Turma */}
      {modalTurmaAberto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {turmaEmEdicao ? 'Editar Turma' : 'Cadastrar Nova Turma'}
              </h3>
              <button onClick={() => setModalTurmaAberto(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarTurmaSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Turma *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Berçário II, Maternal I A, 1º Período B..."
                  value={formTurmaNome}
                  onChange={(e) => setFormTurmaNome(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Turno *</label>
                <select
                  value={formTurmaTurno}
                  onChange={(e) => setFormTurmaTurno(e.target.value as Turma['turno'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Matutino">Matutino</option>
                  <option value="Vespertino">Vespertino</option>
                  <option value="Integral">Integral</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalTurmaAberto(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Salvar Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
