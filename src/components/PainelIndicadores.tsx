import React from 'react';
import { RegistroBuscaAtiva, Turma, Aluno } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  School, 
  FileText,
  CalendarCheck,
  Percent
} from 'lucide-react';

interface PainelIndicadoresProps {
  registros: RegistroBuscaAtiva[];
  turmas: Turma[];
  alunos: Aluno[];
  onVisualizarRegistro: (registro: RegistroBuscaAtiva) => void;
}

export const PainelIndicadores: React.FC<PainelIndicadoresProps> = ({
  registros,
  turmas,
  alunos,
  onVisualizarRegistro,
}) => {
  const totalRegistros = registros.length;
  const totalFaltasGerais = registros.reduce((acc, r) => acc + (Number(r.totalFaltas) || 0), 0);
  const totalAtestadosGerais = registros.reduce((acc, r) => acc + (Number(r.totalDiasAtestado) || 0), 0);
  const totalPerdaCargaGeral = registros.reduce((acc, r) => acc + (Number(r.totalDiasPerdaCargaHoraria) || 0), 0);

  const casosResolvidos = registros.filter(r => r.status.includes('Resolvido')).length;
  const taxaResolucao = totalRegistros > 0 ? Math.round((casosResolvidos / totalRegistros) * 100) : 0;

  // Agrupamento de faltas por turma
  const faltasPorTurma = turmas.map(t => {
    const regsTurma = registros.filter(r => r.turmaId === t.id || r.turma === t.nome);
    const faltas = regsTurma.reduce((acc, r) => acc + (Number(r.totalFaltas) || 0), 0);
    const perdaCarga = regsTurma.reduce((acc, r) => acc + (Number(r.totalDiasPerdaCargaHoraria) || 0), 0);
    const count = regsTurma.length;
    return {
      turmaNome: t.nome,
      turno: t.turno,
      totalFaltas: faltas,
      totalPerdaCarga: perdaCarga,
      totalRegistros: count
    };
  }).sort((a, b) => b.totalFaltas - a.totalFaltas);

  // Alunos com maior número de faltas / alertas
  const alunosEmAlerta = [...registros]
    .sort((a, b) => b.totalDiasPerdaCargaHoraria - a.totalDiasPerdaCargaHoraria)
    .slice(0, 5);

  return (
    <div id="painel-indicadores" className="space-y-6">
      
      {/* Top Banner Informativo */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2 border border-blue-400/20">
            <TrendingUp className="w-3.5 h-3.5" />
            Monitoramento de Frequência • Educação Infantil
          </span>
          <h2 className="text-xl sm:text-2xl font-bold">Painel Gerencial de Busca Ativa</h2>
          <p className="text-xs sm:text-sm text-blue-200 max-w-2xl mt-1">
            Indicadores consolidados de infrequência, recuperação de carga horária e resolutividade pedagógica do CEMEI Maria de Lourdes.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs px-5 py-3 rounded-xl border border-white/20 text-center min-w-[140px]">
          <span className="text-xs text-blue-200 block font-medium">Taxa de Resolução</span>
          <span className="text-3xl font-extrabold text-white mt-0.5 block">{taxaResolucao}%</span>
          <span className="text-[11px] text-blue-200">{casosResolvidos} de {totalRegistros} casos</span>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Alunos</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">{alunos.length}</p>
          <p className="text-xs text-slate-500 mt-1">Matriculados no CEMEI</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Faltas Brutas</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-bold text-rose-700 mt-2">{totalFaltasGerais}</p>
          <p className="text-xs text-slate-500 mt-1">Dias ausentes acumulados</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Atestados Médicos</span>
            <CalendarCheck className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-700 mt-2">{totalAtestadosGerais}</p>
          <p className="text-xs text-slate-500 mt-1">Dias com laudo justificado</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Perda de Carga</span>
            <Percent className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-700 mt-2">{totalPerdaCargaGeral} d</p>
          <p className="text-xs text-slate-500 mt-1">Sem justificativa médica</p>
        </div>
      </div>

      {/* Grade com Distribuição por Turma e Casos em Destaque */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Distribuição de Faltas por Turma */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <School className="w-4 h-4 text-blue-600" />
              <span>Infrequência e Faltas por Turma</span>
            </h3>
            <span className="text-xs text-slate-500">Ranking de ausências</span>
          </div>

          <div className="space-y-3">
            {faltasPorTurma.map((t, idx) => {
              const maxFaltas = faltasPorTurma[0]?.totalFaltas || 1;
              const percent = maxFaltas > 0 ? (t.totalFaltas / maxFaltas) * 100 : 0;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-800">
                    <span>{t.turmaNome} ({t.turno})</span>
                    <span className="font-bold text-slate-900">{t.totalFaltas} faltas • {t.totalRegistros} buscas</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Casos com Maior Perda de Carga Horária (Atenção Prioritária) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Casos Prioritários (Maior Perda de Carga)</span>
            </h3>
            <span className="text-xs text-slate-500">Top 5 alunos</span>
          </div>

          <div className="space-y-2.5">
            {alunosEmAlerta.map((reg) => (
              <div 
                key={reg.id}
                onClick={() => onVisualizarRegistro(reg)}
                className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 cursor-pointer transition-colors flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{reg.nomeAluno}</h4>
                  <p className="text-[11px] text-slate-500">{reg.turma} • Data: {reg.data}</p>
                  <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{reg.descricao}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-800 text-xs font-bold rounded">
                    {reg.totalDiasPerdaCargaHoraria} dias perdidos
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-1">{reg.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
