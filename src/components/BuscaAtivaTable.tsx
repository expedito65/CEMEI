import React, { useState, useMemo, useEffect } from 'react';
import { 
  RegistroBuscaAtiva, 
  Turma, 
  StatusBuscaAtiva 
} from '../types';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Eye, 
  Edit, 
  Trash2, 
  FileCheck2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  School,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  X,
  UserCheck,
  UserCircle2,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { 
  exportarParaGooglePlanilhas, 
  ExportResult, 
  selectGoogleAccount, 
  initGoogleAuth, 
  logoutGoogle,
  GoogleUserProfile,
  getCurrentUserProfile
} from '../services/googleSheetsService';

interface BuscaAtivaTableProps {
  registros: RegistroBuscaAtiva[];
  turmas: Turma[];
  onNovoRegistro: () => void;
  onEditarRegistro: (registro: RegistroBuscaAtiva) => void;
  onVisualizarRegistro: (registro: RegistroBuscaAtiva) => void;
  onExcluirRegistro: (id: string) => void;
}

export const BuscaAtivaTable: React.FC<BuscaAtivaTableProps> = ({
  registros,
  turmas,
  onNovoRegistro,
  onEditarRegistro,
  onVisualizarRegistro,
  onExcluirRegistro,
}) => {
  const [buscaTexto, setBuscaTexto] = useState('');
  const [turmaFiltro, setTurmaFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [viewMode, setViewMode] = useState<'tabela' | 'cards'>('tabela');
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);
  const [exportSuccessResult, setExportSuccessResult] = useState<ExportResult | null>(null);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(null);
  const [copiadoLink, setCopiadoLink] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUserProfile | null>(getCurrentUserProfile());

  // Monitorar autenticação do Google
  useEffect(() => {
    const unsubscribe = initGoogleAuth((user) => {
      setGoogleUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Trocar / Escolher conta do Google
  const handleEscolherContaGoogle = async () => {
    try {
      setIsSwitchingAccount(true);
      const res = await selectGoogleAccount();
      setGoogleUser(res.profile);
    } catch (err: any) {
      if (err.message && !err.message.includes('cancelado')) {
        console.error('Erro ao alternar conta Google:', err);
        setExportErrorMessage(err.message || 'Não foi possível autenticar a conta do Google.');
      }
    } finally {
      setIsSwitchingAccount(false);
    }
  };

  const handleLogoutGoogle = async () => {
    await logoutGoogle();
    setGoogleUser(null);
  };

  // Filtragem dos registros
  const registrosFiltrados = useMemo(() => {
    return registros.filter((reg) => {
      const matchBusca = 
        buscaTexto === '' ||
        reg.nomeAluno.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        reg.turma.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        reg.descricao.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        reg.retornoBuscaAtiva.toLowerCase().includes(buscaTexto.toLowerCase()) ||
        reg.descricaoPortariaSemed.toLowerCase().includes(buscaTexto.toLowerCase());

      const matchTurma = turmaFiltro === '' || reg.turmaId === turmaFiltro || reg.turma === turmaFiltro;
      const matchStatus = statusFiltro === '' || reg.status === statusFiltro;

      const matchDataInicio = dataInicio === '' || reg.data >= dataInicio;
      const matchDataFim = dataFim === '' || reg.data <= dataFim;

      return matchBusca && matchTurma && matchStatus && matchDataInicio && matchDataFim;
    });
  }, [registros, buscaTexto, turmaFiltro, statusFiltro, dataInicio, dataFim]);

  // Totais resumidos
  const metricas = useMemo(() => {
    const totalRegistros = registrosFiltrados.length;
    const totalFaltas = registrosFiltrados.reduce((acc, curr) => acc + (Number(curr.totalFaltas) || 0), 0);
    const totalAtestados = registrosFiltrados.reduce((acc, curr) => acc + (Number(curr.totalDiasAtestado) || 0), 0);
    const totalPerdaCarga = registrosFiltrados.reduce((acc, curr) => acc + (Number(curr.totalDiasPerdaCargaHoraria) || 0), 0);
    const totalResolvidos = registrosFiltrados.filter(r => r.status.includes('Resolvido')).length;

    return { totalRegistros, totalFaltas, totalAtestados, totalPerdaCarga, totalResolvidos };
  }, [registrosFiltrados]);

  // Exportar para Planilha do Google (Google Sheets / Docs)
  const handleExportGoogleSheets = async () => {
    if (registrosFiltrados.length === 0) {
      alert('Não há registros para exportar com os filtros atuais.');
      return;
    }

    try {
      setIsExportingSheets(true);
      setExportErrorMessage(null);
      const result = await exportarParaGooglePlanilhas(registrosFiltrados);
      setExportSuccessResult(result);
    } catch (err: any) {
      console.error('Erro ao exportar para o Google Sheets:', err);
      const msg = err?.message || 'Ocorreu um erro ao conectar com o Google Planilhas. Verifique suas permissões.';
      setExportErrorMessage(msg);
      alert(`Atenção: ${msg}`);
    } finally {
      setIsExportingSheets(false);
    }
  };

  const handleCopiarLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiadoLink(true);
    setTimeout(() => setCopiadoLink(false), 2500);
  };

  // Exportar para CSV (Backup Offline)
  const handleExportCSV = () => {
    if (registrosFiltrados.length === 0) {
      alert('Não há registros para exportar com os filtros atuais.');
      return;
    }

    const headers = [
      'ID',
      'Data',
      'Nome do Aluno',
      'Turma',
      'Total de Faltas',
      'Total de Dias de Atestado',
      'Total de Dias de Perda de Carga Horaria',
      'Infrequencia Nao Justificada',
      'Descricao',
      'Retorno da Busca Ativa',
      'Descricao da Portaria SEMED',
      'Status'
    ];

    const rows = registrosFiltrados.map((r) => {
      const faltas = r.totalFaltas || 0;
      const atestado = r.totalDiasAtestado || 0;
      const perda = r.totalDiasPerdaCargaHoraria || 0;
      const hasAny = r.totalFaltas !== undefined || r.totalDiasAtestado !== undefined || r.totalDiasPerdaCargaHoraria !== undefined;
      const faltasLiquidas = hasAny ? Math.max(0, faltas - atestado - perda) : '';

      return [
        r.id,
        formatarDataBR(r.data),
        `"${r.nomeAluno.replace(/"/g, '""')}"`,
        `"${r.turma.replace(/"/g, '""')}"`,
        r.totalFaltas !== undefined ? r.totalFaltas : '',
        r.totalDiasAtestado !== undefined ? r.totalDiasAtestado : '',
        r.totalDiasPerdaCargaHoraria !== undefined ? r.totalDiasPerdaCargaHoraria : '',
        faltasLiquidas,
        `"${(r.descricao || '').replace(/"/g, '""')}"`,
        `"${(r.retornoBuscaAtiva || '').replace(/"/g, '""')}"`,
        `"${(r.descricaoPortariaSemed || '').replace(/"/g, '""')}"`,
        `"${r.status.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `busca_ativa_cemei_maria_de_lourdes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: StatusBuscaAtiva) => {
    switch (status) {
      case 'Resolvido - Aluno Retornou':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Resolvido
          </span>
        );
      case 'Em Acompanhamento':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Em Acompanhamento
          </span>
        );
      case 'Encaminhado ao Conselho Tutelar':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Conselho Tutelar
          </span>
        );
      case 'Aguardando Visita Domiciliar':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <School className="w-3.5 h-3.5 text-purple-600" />
            Visita Domiciliar
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <FileCheck2 className="w-3.5 h-3.5 text-slate-600" />
            {status}
          </span>
        );
    }
  };

  return (
    <div id="busca-ativa-section" className="space-y-6">
      
      {/* Resumo Rápido (Cards de Métricas) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total de Buscas</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{metricas.totalRegistros}</p>
          <p className="text-xs text-slate-500 mt-0.5">Registros localizados</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">Total de Faltas</p>
          <p className="text-2xl font-bold text-rose-700 mt-1">{metricas.totalFaltas}</p>
          <p className="text-xs text-slate-500 mt-0.5">Faltas acumuladas</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">Dias Atestado</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{metricas.totalAtestados}</p>
          <p className="text-xs text-slate-500 mt-0.5">Justificados com laudo</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Perda Carga Horária</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{metricas.totalPerdaCarga} dias</p>
          <p className="text-xs text-slate-500 mt-0.5">Horas líquidas perdidas</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Casos Resolvidos</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{metricas.totalResolvidos}</p>
          <p className="text-xs text-slate-500 mt-0.5">Alunos retornaram</p>
        </div>
      </div>

      {/* Painel de Filtros e Busca */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Campo de Busca Livre */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="input-busca-geral"
              type="text"
              placeholder="Buscar por aluno, turma, motivo ou portaria..."
              value={buscaTexto}
              onChange={(e) => setBuscaTexto(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {buscaTexto && (
              <button 
                onClick={() => setBuscaTexto('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Botões de Ação / Exportação */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Alternar visualização em telas médias/pequenas */}
            <div className="flex border border-slate-200 rounded-xl overflow-hidden p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('tabela')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  viewMode === 'tabela' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Tabela
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Cartões
              </button>
            </div>

            {/* Conta Google Conectada / Selecionador de Conta */}
            {googleUser ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                {googleUser.picture ? (
                  <img
                    src={googleUser.picture}
                    alt={googleUser.name || 'Google User'}
                    className="w-4 h-4 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">
                    {googleUser.email?.charAt(0).toUpperCase() || 'G'}
                  </div>
                )}
                <span className="font-medium truncate max-w-[130px] sm:max-w-[180px]" title={googleUser.email || ''}>
                  {googleUser.email}
                </span>
                <button
                  onClick={handleEscolherContaGoogle}
                  disabled={isSwitchingAccount}
                  className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold underline ml-1 cursor-pointer disabled:opacity-50"
                  title="Trocar e escolher outra conta do Google para o Drive"
                >
                  {isSwitchingAccount ? 'Alterando...' : 'Trocar conta'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleEscolherContaGoogle}
                disabled={isSwitchingAccount}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
                title="Escolher qual conta do Google utilizar para o Google Drive"
              >
                <UserCircle2 className="w-4 h-4 text-slate-500" />
                <span>{isSwitchingAccount ? 'Conectando...' : 'Escolher Conta Google'}</span>
              </button>
            )}

            <button
              id="btn-export-google-sheets"
              onClick={handleExportGoogleSheets}
              disabled={isExportingSheets}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-2xs transition-all disabled:opacity-50"
              title="Criar e exportar os dados diretamente para o Google Drive / Planilhas na conta selecionada"
            >
              {isExportingSheets ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando no Google Drive...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                  <span>Exportar para Google Planilhas</span>
                </>
              )}
            </button>

            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-xs font-medium rounded-xl border border-slate-200 transition-colors"
              title="Baixar cópia em formato CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Filtros Avançados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          
          {/* Filtro por Turma */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Filtrar Turma</label>
            <select
              id="select-filtro-turma"
              value={turmaFiltro}
              onChange={(e) => setTurmaFiltro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as Turmas do CEMEI</option>
              {turmas.map((t) => (
                <option key={t.id} value={t.nome}>
                  {t.nome} ({t.turno})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status da Busca Ativa</label>
            <select
              id="select-filtro-status"
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os Status</option>
              <option value="Resolvido - Aluno Retornou">Resolvido - Aluno Retornou</option>
              <option value="Em Acompanhamento">Em Acompanhamento</option>
              <option value="Aguardando Visita Domiciliar">Aguardando Visita Domiciliar</option>
              <option value="Encaminhado ao Conselho Tutelar">Encaminhado ao Conselho Tutelar</option>
            </select>
          </div>

          {/* Filtro Data Inicial */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Data De</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro Data Final */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Data Até</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {(turmaFiltro || statusFiltro || dataInicio || dataFim) && (
                <button
                  onClick={() => {
                    setTurmaFiltro('');
                    setStatusFiltro('');
                    setDataInicio('');
                    setDataFim('');
                  }}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg whitespace-nowrap"
                  title="Limpar todos os filtros"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Exibição: Tabela Completa (Conforme campos solicitados) */}
      {viewMode === 'tabela' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Tabela de Registros de Busca Ativa - CEMEI Maria de Lourdes
              </h2>
              <span className="text-xs font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                {registrosFiltrados.length} {registrosFiltrados.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table id="tabela-busca-ativa" className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-3 min-w-[90px]">Data</th>
                  <th className="py-3.5 px-3 min-w-[170px]">Nome do Aluno</th>
                  <th className="py-3.5 px-3 min-w-[130px]">Turma</th>
                  <th className="py-3.5 px-2 text-center min-w-[80px]" title="Total de Faltas">Total de Faltas</th>
                  <th className="py-3.5 px-2 text-center min-w-[90px]" title="Total de Dias de Atestado">Dias Atestado</th>
                  <th className="py-3.5 px-2 text-center min-w-[110px]" title="Total de Dias de Perda de Carga Horária">Perda Carga Horária</th>
                  <th className="py-3.5 px-2 text-center min-w-[120px]" title="Infrequência Não Justificada">Infrequência Não Justificada</th>
                  <th className="py-3.5 px-3 min-w-[180px]">Descrição</th>
                  <th className="py-3.5 px-3 min-w-[180px]">Retorno da Busca Ativa</th>
                  <th className="py-3.5 px-3 min-w-[200px]">Descrição da Portaria SEMED</th>
                  <th className="py-3.5 px-3 text-center min-w-[100px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {registrosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertTriangle className="w-8 h-8 text-slate-300" />
                        <p className="text-sm font-medium text-slate-600">Nenhum registro de busca ativa encontrado.</p>
                        <p className="text-xs text-slate-400">Tente ajustar seus termos de busca ou clique no botão abaixo para adicionar.</p>
                        <button
                          onClick={onNovoRegistro}
                          className="mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                        >
                          Adicionar Registro
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  registrosFiltrados.map((reg) => (
                    <tr 
                      key={reg.id} 
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* Campo 1: Data */}
                      <td className="py-3 px-3 font-medium text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{formatarDataBR(reg.data)}</span>
                        </div>
                      </td>

                      {/* Campo 2: Nome do Aluno */}
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <button
                          onClick={() => onVisualizarRegistro(reg)}
                          className="text-left hover:text-blue-600 hover:underline transition-colors block"
                        >
                          {reg.nomeAluno}
                        </button>
                        <div className="mt-1">
                          {getStatusBadge(reg.status)}
                        </div>
                      </td>

                      {/* Campo 3: Turma */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-medium text-[11px] border border-slate-200">
                          {reg.turma}
                        </span>
                      </td>

                      {/* Campo 4: Total de Faltas */}
                      <td className="py-3 px-2 text-center">
                        {reg.totalFaltas !== undefined ? (
                          <span className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded text-xs ${
                            reg.totalFaltas > 5 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {reg.totalFaltas}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>

                      {/* Campo 5: Total de Dias de Atestado */}
                      <td className="py-3 px-2 text-center">
                        {reg.totalDiasAtestado !== undefined ? (
                          <span className="inline-flex items-center justify-center font-medium px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                            {reg.totalDiasAtestado}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>

                      {/* Campo 6: Total de Dias de Perda de Carga Horária */}
                      <td className="py-3 px-2 text-center">
                        {reg.totalDiasPerdaCargaHoraria !== undefined ? (
                          <span className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded text-xs ${
                            reg.totalDiasPerdaCargaHoraria > 3 ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {reg.totalDiasPerdaCargaHoraria} dias
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>

                      {/* Campo: Infrequência Não Justificada (Fórmula: Total de Faltas - Dias Atestado - Perda Carga Horária) */}
                      <td className="py-3 px-2 text-center">
                        {reg.totalFaltas !== undefined || reg.totalDiasAtestado !== undefined || reg.totalDiasPerdaCargaHoraria !== undefined ? (
                          (() => {
                            const faltas = reg.totalFaltas || 0;
                            const atestado = reg.totalDiasAtestado || 0;
                            const perda = reg.totalDiasPerdaCargaHoraria || 0;
                            const valorLiquido = Math.max(0, faltas - atestado - perda);
                            return (
                              <span
                                className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded text-xs ${
                                  valorLiquido > 3
                                    ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                }`}
                                title={`Cálculo automático: ${faltas} (Faltas) - ${atestado} (Atestado) - ${perda} (Perda C.H.) = ${valorLiquido} dias de infrequência não justificada`}
                              >
                                {valorLiquido}
                              </span>
                            );
                          })()
                        ) : (
                          <span className="text-slate-400 font-normal">—</span>
                        )}
                      </td>

                      {/* Campo 7: Descrição */}
                      <td className="py-3 px-3 max-w-[220px]">
                        <p className={`line-clamp-2 text-[11px] leading-relaxed ${reg.descricao ? 'text-slate-700' : 'text-slate-400 font-normal'}`} title={reg.descricao || 'Sem descrição'}>
                          {reg.descricao || '—'}
                        </p>
                      </td>

                      {/* Campo 8: Retorno da Busca Ativa */}
                      <td className="py-3 px-3 max-w-[220px]">
                        <p className={`line-clamp-2 text-[11px] leading-relaxed ${reg.retornoBuscaAtiva ? 'text-slate-800 font-medium' : 'text-slate-400 font-normal'}`} title={reg.retornoBuscaAtiva || 'Sem retorno registrado'}>
                          {reg.retornoBuscaAtiva || '—'}
                        </p>
                      </td>

                      {/* Campo 9: Descrição da Portaria SEMED */}
                      <td className="py-3 px-3 max-w-[240px]">
                        {reg.descricaoPortariaSemed ? (
                          <span className="inline-block text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 leading-tight" title={reg.descricaoPortariaSemed}>
                            {reg.descricaoPortariaSemed}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal text-xs">—</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            id={`btn-view-${reg.id}`}
                            onClick={() => onVisualizarRegistro(reg)}
                            title="Visualizar detalhes da busca ativa"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-edit-${reg.id}`}
                            onClick={() => onEditarRegistro(reg)}
                            title="Editar registro"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            id={`btn-delete-${reg.id}`}
                            onClick={() => {
                              if (window.confirm(`Tem certeza que deseja excluir o registro de busca ativa de "${reg.nomeAluno}"?`)) {
                                onExcluirRegistro(reg.id);
                              }
                            }}
                            title="Excluir registro"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visualização em Cartões (Ideal para Smartphones e Telas Menores) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registrosFiltrados.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 p-6">
              <p className="text-sm font-medium text-slate-600">Nenhum registro encontrado com os filtros atuais.</p>
            </div>
          ) : (
            registrosFiltrados.map((reg) => (
              <div 
                key={reg.id} 
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatarDataBR(reg.data)}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
                        {reg.turma}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{reg.nomeAluno}</h3>
                  </div>
                  <div>
                    {getStatusBadge(reg.status)}
                  </div>
                </div>

                {/* Métricas de Frequência */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-center">
                  <div>
                    <span className="block text-[10px] text-slate-500 font-semibold uppercase">Total Faltas</span>
                    <span className="text-sm font-bold text-rose-700">{reg.totalFaltas}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-semibold uppercase">Atestados</span>
                    <span className="text-sm font-bold text-blue-700">{reg.totalDiasAtestado}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-semibold uppercase">Perda Carga</span>
                    <span className="text-sm font-bold text-amber-700">{reg.totalDiasPerdaCargaHoraria} d</span>
                  </div>
                </div>

                {/* Descrições */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 block">Descrição do Motivo / Ocorrência:</span>
                    <p className="text-slate-600 mt-0.5">{reg.descricao}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Retorno da Busca Ativa:</span>
                    <p className="text-emerald-800 font-medium bg-emerald-50/60 p-2 rounded-lg border border-emerald-100 mt-0.5">
                      {reg.retornoBuscaAtiva}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Descrição da Portaria SEMED:</span>
                    <p className="text-slate-600 bg-slate-100 p-2 rounded-lg border border-slate-200 mt-0.5 text-[11px]">
                      {reg.descricaoPortariaSemed}
                    </p>
                  </div>
                </div>

                {/* Ações do Card */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => onVisualizarRegistro(reg)}
                    className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detalhes</span>
                  </button>
                  <button
                    onClick={() => onEditarRegistro(reg)}
                    className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Excluir o registro de "${reg.nomeAluno}"?`)) {
                        onExcluirRegistro(reg.id);
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de Sucesso da Exportação para o Google Planilhas */}
      {exportSuccessResult && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Planilha do Google Criada!
                  </h3>
                  <p className="text-xs text-slate-500">
                    Disponível no seu Google Drive / Google Documentos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExportSuccessResult(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Conta Google:</span>
                <span className="text-blue-700 font-semibold truncate max-w-[260px]">
                  {exportSuccessResult.userEmail || googleUser?.email || 'Conta Selecionada'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Nome da Planilha:</span>
                <span className="text-slate-800 font-semibold truncate max-w-[260px]">
                  {exportSuccessResult.title}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Registros Exportados:</span>
                <span className="text-emerald-700 font-bold">
                  {exportSuccessResult.totalRegistros} aluno(s)
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Colunas incluídas:</span>
                <span className="text-slate-700 font-medium">
                  Faltas, Atestado, Perda C.H., Infrequência Não Justificada...
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a
                href={exportSuccessResult.spreadsheetUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all text-center"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir no Google Planilhas</span>
              </a>

              <button
                onClick={() => handleCopiarLink(exportSuccessResult.spreadsheetUrl)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
                title="Copiar link da planilha"
              >
                {copiadoLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setExportSuccessResult(null)}
                className="px-3 py-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium rounded-xl hover:bg-slate-100 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Orientação de Permissão / Autorização do Google Drive */}
      {exportErrorMessage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-amber-200 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Autorização do Google Necessária
                  </h3>
                  <p className="text-xs text-slate-500">
                    Permissão para salvar a planilha no Google Drive
                  </p>
                </div>
              </div>
              <button
                onClick={() => setExportErrorMessage(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-950 space-y-2.5 leading-relaxed">
              <p className="font-semibold text-amber-900">
                Para que a planilha seja criada diretamente na sua conta, siga estes 3 passos simples na janela do Google:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-700">
                <li>Escolha ou faça login com sua conta do Google.</li>
                <li>
                  <strong className="text-slate-900">Importante:</strong> Marque a caixa de seleção permitindo <span className="underline font-semibold">criar, editar e acessar planilhas do Google Drive</span>.
                </li>
                <li>Clique em <strong className="text-slate-900">Continuar / Permitir</strong>.</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={async () => {
                  setExportErrorMessage(null);
                  await handleExportGoogleSheets();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all text-center"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Autorizar e Exportar Agora</span>
              </button>

              <button
                onClick={() => {
                  setExportErrorMessage(null);
                  handleExportCSV();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
                title="Baixar arquivo em CSV offline"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Baixar CSV</span>
              </button>

              <button
                onClick={() => setExportErrorMessage(null)}
                className="px-3 py-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Função utilitária para formatar data YYYY-MM-DD -> DD/MM/YYYY
function formatarDataBR(dataStr: string): string {
  if (!dataStr) return '-';
  const parts = dataStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dataStr;
}
