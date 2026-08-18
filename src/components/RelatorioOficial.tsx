import React from 'react';
import { RegistroBuscaAtiva, Turma, Aluno } from '../types';
import { EscolaInfo } from '../data/initialData';
import { Printer, Download, FileText, CheckCircle, Calendar, School } from 'lucide-react';

interface RelatorioOficialProps {
  registros: RegistroBuscaAtiva[];
  turmas: Turma[];
  alunos: Aluno[];
  escolaInfo: EscolaInfo;
}

export const RelatorioOficial: React.FC<RelatorioOficialProps> = ({
  registros,
  turmas,
  alunos,
  escolaInfo,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const totalRegistros = registros.length;
  const totalFaltas = registros.reduce((acc, r) => acc + (Number(r.totalFaltas) || 0), 0);
  const totalAtestados = registros.reduce((acc, r) => acc + (Number(r.totalDiasAtestado) || 0), 0);
  const totalPerdaCarga = registros.reduce((acc, r) => acc + (Number(r.totalDiasPerdaCargaHoraria) || 0), 0);
  const totalResolvidos = registros.filter(r => r.status.includes('Resolvido')).length;

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div id="relatorio-oficial-section" className="space-y-6">
      
      {/* Botões de Ação na tela (escondidos na impressão) */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-900">Relatório Consolidado de Busca Ativa Escolar</h2>
          <p className="text-xs text-slate-500">Documento oficial pronto para arquivamento e prestação de contas junto à SEMED</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Gerar PDF</span>
          </button>
        </div>
      </div>

      {/* Folha do Relatório Oficial (Formato A4/Ofício) */}
      <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-800 print:border-none print:shadow-none print:p-0">
        
        {/* Cabeçalho Oficial */}
        <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
              ML
            </div>
          </div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700">
            ESTADO DE MINAS GERAIS • PREFEITURA MUNICIPAL
          </h2>
          <h3 className="text-base font-bold text-slate-900 uppercase">
            {escolaInfo.semedOrgao}
          </h3>
          <h1 className="text-xl font-extrabold text-blue-900 uppercase tracking-tight">
            {escolaInfo.nome}
          </h1>
          <p className="text-xs text-slate-500">
            Código INEP: {escolaInfo.inep} • Ano Letivo: {escolaInfo.anoLetivo}
          </p>
          <div className="pt-2">
            <span className="inline-block px-4 py-1 bg-slate-100 text-slate-900 rounded font-bold text-xs uppercase tracking-wider border border-slate-300">
              RELATÓRIO CONSOLIDADO DE BUSCA ATIVA E FREQUÊNCIA ESCOLAR
            </span>
          </div>
        </div>

        {/* Informações da Unidade e Período */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block font-medium">Unidade de Ensino:</span>
            <span className="font-bold text-slate-800">{escolaInfo.nome}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Direção Escolar:</span>
            <span className="font-bold text-slate-800 text-slate-400 font-normal italic">—</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Supervisão Pedagógica:</span>
            <span className="font-bold text-slate-800 text-slate-400 font-normal italic">—</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">Data de Emissão:</span>
            <span className="font-bold text-slate-800">{dataAtual}</span>
          </div>
        </div>

        {/* Quadro Síntese de Indicadores */}
        <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
          <div className="bg-slate-100 p-2.5 font-bold text-slate-900 border-b border-slate-300 uppercase tracking-wider">
            1. Síntese Geral de Ocorrências e Busca Ativa
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-slate-200 text-center p-3">
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Total de Registros</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">{totalRegistros}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Total de Faltas</span>
              <span className="text-lg font-bold text-rose-700 mt-0.5 block">{totalFaltas} dias</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Dias de Atestado</span>
              <span className="text-lg font-bold text-blue-700 mt-0.5 block">{totalAtestados} dias</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Perda de Carga Horária</span>
              <span className="text-lg font-bold text-amber-700 mt-0.5 block">{totalPerdaCarga} dias</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Casos Resolvidos</span>
              <span className="text-lg font-bold text-emerald-700 mt-0.5 block">{totalResolvidos}</span>
            </div>
          </div>
        </div>

        {/* Tabela Oficial Completa com todos os campos solicitados */}
        <div className="space-y-2">
          <div className="bg-slate-100 p-2.5 rounded font-bold text-xs text-slate-900 uppercase tracking-wider border border-slate-300">
            2. Detalhamento Cronológico das Buscas Ativas Realizadas
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
              <thead>
                <tr className="bg-slate-200/80 text-slate-900 border-b border-slate-300 font-bold uppercase">
                  <th className="py-2.5 px-2 border-r border-slate-300 w-16">Data</th>
                  <th className="py-2.5 px-2 border-r border-slate-300 w-40">Nome do Aluno</th>
                  <th className="py-2.5 px-2 border-r border-slate-300 w-28">Turma</th>
                  <th className="py-2.5 px-1 text-center border-r border-slate-300 w-14">Faltas</th>
                  <th className="py-2.5 px-1 text-center border-r border-slate-300 w-14">Atest.</th>
                  <th className="py-2.5 px-1 text-center border-r border-slate-300 w-16">Perda C.H.</th>
                  <th className="py-2.5 px-2 border-r border-slate-300">Descrição</th>
                  <th className="py-2.5 px-2 border-r border-slate-300">Retorno da Busca Ativa</th>
                  <th className="py-2.5 px-2">Descrição da Portaria SEMED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-800">
                {registros.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-slate-400">
                      Nenhuma ocorrência registrada no período.
                    </td>
                  </tr>
                ) : (
                  registros.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="py-2 px-2 border-r border-slate-200 font-medium whitespace-nowrap">
                        {formatarDataBR(r.data)}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 font-bold">
                        {r.nomeAluno}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 whitespace-nowrap">
                        {r.turma}
                      </td>
                      <td className="py-2 px-1 text-center border-r border-slate-200 font-semibold">
                        {r.totalFaltas}
                      </td>
                      <td className="py-2 px-1 text-center border-r border-slate-200">
                        {r.totalDiasAtestado}
                      </td>
                      <td className="py-2 px-1 text-center border-r border-slate-200 font-bold">
                        {r.totalDiasPerdaCargaHoraria}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-[10px] leading-tight">
                        {r.descricao}
                      </td>
                      <td className="py-2 px-2 border-r border-slate-200 text-[10px] leading-tight font-medium">
                        {r.retornoBuscaAtiva}
                      </td>
                      <td className="py-2 px-2 text-[10px] leading-tight font-mono text-slate-700">
                        {r.descricaoPortariaSemed}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Termo de Encerramento e Assinaturas */}
        <div className="pt-8 space-y-12 border-t border-slate-300">
          <p className="text-xs text-slate-600 text-justify leading-relaxed">
            Certificamos que as ações de busca ativa, contatos com famílias, registros de frequência e notificações descritas neste documento foram devidamente apuradas e executadas pela equipe pedagógica do <strong>{escolaInfo.nome}</strong> em estreita observância às diretrizes e portarias vigentes da Secretaria Municipal de Educação (SEMED).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-6 text-center text-xs">
            <div>
              <div className="border-t border-slate-900 w-4/5 mx-auto pt-2 min-h-[28px]">
                {/* Espaço em branco para assinatura manual e carimbo */}
              </div>
              <span className="font-bold text-slate-900 block text-xs">Direção Escolar</span>
              <span className="text-slate-500 text-[11px] block">{escolaInfo.nome}</span>
            </div>

            <div>
              <div className="border-t border-slate-900 w-4/5 mx-auto pt-2 min-h-[28px]">
                {/* Espaço em branco para assinatura manual e carimbo */}
              </div>
              <span className="font-bold text-slate-900 block text-xs">Supervisão Pedagógica</span>
              <span className="text-slate-500 text-[11px] block">Equipe Pedagógica CEMEI</span>
            </div>
          </div>
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
