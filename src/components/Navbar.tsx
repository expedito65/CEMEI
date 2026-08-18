import React from 'react';
import { 
  GraduationCap, 
  ClipboardList, 
  Users, 
  BarChart3, 
  FileText, 
  PlusCircle, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { EscolaInfo } from '../data/initialData';

interface NavbarProps {
  activeTab: 'registros' | 'turmas' | 'indicadores' | 'relatorio';
  setActiveTab: (tab: 'registros' | 'turmas' | 'indicadores' | 'relatorio') => void;
  onOpenNovoRegistro: () => void;
  onResetData: () => void;
  escolaInfo: EscolaInfo;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNovoRegistro,
  onResetData,
  escolaInfo
}) => {
  return (
    <header id="main-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & School Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm ring-4 ring-blue-50">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 tracking-wide uppercase">
                  SEMED
                </span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
                  Ano Letivo {escolaInfo.anoLetivo}
                </span>
              </div>
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 leading-tight">
                {escolaInfo.nome}
              </h1>
              <p className="text-xs text-slate-500 hidden md:block">
                Sistema de Registro e Gestão de Busca Ativa Escolar
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-reset-data"
              onClick={onResetData}
              title="Restaurar dados de exemplo do CEMEI"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-xs flex items-center gap-1.5 border border-slate-200 hidden sm:flex"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Dados</span>
            </button>

            <button
              id="btn-novo-registro-topo"
              onClick={onOpenNovoRegistro}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold">Nova Busca Ativa</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-1 sm:space-x-2 py-2 border-t border-slate-100 no-scrollbar">
          <button
            id="tab-registros"
            onClick={() => setActiveTab('registros')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'registros'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Buscas Ativas (Tabela)</span>
          </button>

          <button
            id="tab-turmas"
            onClick={() => setActiveTab('turmas')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'turmas'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Turmas e Alunos</span>
          </button>

          <button
            id="tab-indicadores"
            onClick={() => setActiveTab('indicadores')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'indicadores'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Painel de Indicadores</span>
          </button>

          <button
            id="tab-relatorio"
            onClick={() => setActiveTab('relatorio')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeTab === 'relatorio'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Relatório Oficial SEMED</span>
          </button>
        </div>
      </div>
    </header>
  );
};
