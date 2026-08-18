import React from 'react';
import { RegistroBuscaAtiva, StatusBuscaAtiva } from '../types';
import { 
  X, 
  Printer, 
  Calendar, 
  User, 
  School, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck2,
  Phone,
  Bookmark,
  Share2
} from 'lucide-react';

interface BuscaAtivaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  registro: RegistroBuscaAtiva | null;
  onEditar: (registro: RegistroBuscaAtiva) => void;
  onAtualizarStatus: (id: string, novoStatus: StatusBuscaAtiva) => void;
}

export const BuscaAtivaDetailsModal: React.FC<BuscaAtivaDetailsModalProps> = ({
  isOpen,
  onClose,
  registro,
  onEditar,
  onAtualizarStatus,
}) => {
  if (!isOpen || !registro) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold">Ficha de Registro de Busca Ativa</h2>
              <p className="text-xs text-slate-400">CEMEI Maria de Lourdes • SEMED</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs flex items-center gap-1"
              title="Imprimir Ficha Individual"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable & Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm">
          
          {/* Identificação Principal */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
            <div>
              <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider">Aluno(a)</span>
              <h3 className="text-lg font-bold text-slate-900">{registro.nomeAluno}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                  {registro.turma}
                </span>
                <span className="text-xs text-slate-500">
                  Data: {formatarDataBR(registro.data)}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[11px] text-slate-500 font-medium">Status Atual</span>
              <select
                value={registro.status}
                onChange={(e) => onAtualizarStatus(registro.id, e.target.value as StatusBuscaAtiva)}
                className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                <option value="Em Acompanhamento">Em Acompanhamento</option>
                <option value="Resolvido - Aluno Retornou">Resolvido - Aluno Retornou</option>
                <option value="Aguardando Visita Domiciliar">Aguardando Visita Domiciliar</option>
                <option value="Encaminhado ao Conselho Tutelar">Encaminhado ao Conselho Tutelar</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>
          </div>

          {/* Quadro de Frequência */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-xs text-slate-500 font-semibold block uppercase">Total de Faltas</span>
              <span className="text-2xl font-bold text-rose-700 mt-1 block">
                {registro.totalFaltas !== undefined ? registro.totalFaltas : '—'}
              </span>
              <span className="text-[10px] text-slate-400">dias registrados</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block uppercase">Dias Atestado</span>
              <span className="text-2xl font-bold text-blue-700 mt-1 block">
                {registro.totalDiasAtestado !== undefined ? registro.totalDiasAtestado : '—'}
              </span>
              <span className="text-[10px] text-slate-400">justificados</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold block uppercase">Perda Carga Horária</span>
              <span className="text-2xl font-bold text-amber-700 mt-1 block">
                {registro.totalDiasPerdaCargaHoraria !== undefined ? `${registro.totalDiasPerdaCargaHoraria} dias` : '—'}
              </span>
              <span className="text-[10px] text-slate-400">dias de perda</span>
            </div>
            <div className="bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block uppercase">Infrequência Não Justificada</span>
              <span className="text-2xl font-bold text-emerald-900 mt-0.5 block">
                {registro.totalFaltas !== undefined || registro.totalDiasAtestado !== undefined || registro.totalDiasPerdaCargaHoraria !== undefined
                  ? Math.max(0, (registro.totalFaltas || 0) - (registro.totalDiasAtestado || 0) - (registro.totalDiasPerdaCargaHoraria || 0))
                  : '—'}
              </span>
              <span className="text-[10px] text-emerald-700">Faltas - Atestado - Perda</span>
            </div>
          </div>

          {/* Descrição Detalhada */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              <span>Descrição da Ocorrência</span>
            </span>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm leading-relaxed">
              {registro.descricao || <span className="text-slate-400 italic">Nenhuma descrição detalhada informada.</span>}
            </div>
          </div>

          {/* Retorno da Busca Ativa */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Retorno da Busca Ativa</span>
            </span>
            <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 text-emerald-950 font-medium text-xs sm:text-sm leading-relaxed">
              {registro.retornoBuscaAtiva || <span className="text-slate-400 font-normal italic">Nenhum retorno registrado até o momento.</span>}
            </div>
          </div>

          {/* Enquadramento SEMED */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-purple-600" />
              <span>Descrição da Portaria SEMED Aplicável</span>
            </span>
            <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 text-slate-800 text-xs leading-relaxed font-mono">
              {registro.descricaoPortariaSemed || <span className="text-slate-400 font-sans italic">Nenhuma portaria específica vinculada.</span>}
            </div>
          </div>

          {/* Metadados / Assinatura do Registro */}
          <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between gap-2">
            <span>Registrado por: <strong>{registro.registradoPor || 'Equipe CEMEI'}</strong></span>
            <span>ID do Registro: <code className="bg-white px-1.5 py-0.5 rounded border">{registro.id}</code></span>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onEditar(registro);
            }}
            className="px-4 py-2 text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors"
          >
            Editar Dados
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

function formatarDataBR(dataStr: string): string {
  if (!dataStr) return '-';
  const parts = dataStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dataStr;
}
