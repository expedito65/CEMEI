/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Turma, 
  Aluno, 
  RegistroBuscaAtiva, 
  StatusBuscaAtiva 
} from './types';
import { 
  storage, 
  EscolaInfo 
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { BuscaAtivaTable } from './components/BuscaAtivaTable';
import { BuscaAtivaModal } from './components/BuscaAtivaModal';
import { BuscaAtivaDetailsModal } from './components/BuscaAtivaDetailsModal';
import { TurmasAlunosManager } from './components/TurmasAlunosManager';
import { PainelIndicadores } from './components/PainelIndicadores';
import { RelatorioOficial } from './components/RelatorioOficial';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'registros' | 'turmas' | 'indicadores' | 'relatorio'>('registros');

  // Data States loaded from Storage
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [registros, setRegistros] = useState<RegistroBuscaAtiva[]>([]);
  const [escolaInfo, setEscolaInfo] = useState<EscolaInfo>(storage.getEscolaInfo());

  // Modal States
  const [isModalBuscaOpen, setIsModalBuscaOpen] = useState(false);
  const [registroEmEdicao, setRegistroEmEdicao] = useState<RegistroBuscaAtiva | null>(null);

  const [isModalDetailsOpen, setIsModalDetailsOpen] = useState(false);
  const [registroEmVisualizacao, setRegistroEmVisualizacao] = useState<RegistroBuscaAtiva | null>(null);

  // Initial Load
  useEffect(() => {
    setTurmas(storage.getTurmas());
    setAlunos(storage.getAlunos());
    setRegistros(storage.getRegistros());
    setEscolaInfo(storage.getEscolaInfo());
  }, []);

  // CRUD Buscas Ativas
  const handleSaveRegistro = (dados: Omit<RegistroBuscaAtiva, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    let novosRegistros: RegistroBuscaAtiva[];

    if (dados.id) {
      // Edição
      novosRegistros = registros.map(r => {
        if (r.id === dados.id) {
          return {
            ...r,
            ...dados,
            updatedAt: new Date().toISOString(),
          } as RegistroBuscaAtiva;
        }
        return r;
      });
    } else {
      // Novo registro
      const novo: RegistroBuscaAtiva = {
        ...dados,
        id: `busca-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      novosRegistros = [novo, ...registros];
    }

    setRegistros(novosRegistros);
    storage.saveRegistros(novosRegistros);
    setRegistroEmEdicao(null);
  };

  const handleExcluirRegistro = (id: string) => {
    const filtrados = registros.filter(r => r.id !== id);
    setRegistros(filtrados);
    storage.saveRegistros(filtrados);
  };

  const handleAtualizarStatusRegistro = (id: string, novoStatus: StatusBuscaAtiva) => {
    const atualizados = registros.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: novoStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });
    setRegistros(atualizados);
    storage.saveRegistros(atualizados);
    if (registroEmVisualizacao && registroEmVisualizacao.id === id) {
      setRegistroEmVisualizacao({
        ...registroEmVisualizacao,
        status: novoStatus
      });
    }
  };

  // CRUD Turmas
  const handleSaveTurma = (turma: Turma) => {
    const exists = turmas.some(t => t.id === turma.id);
    let novasTurmas: Turma[];
    if (exists) {
      novasTurmas = turmas.map(t => t.id === turma.id ? turma : t);
    } else {
      novasTurmas = [...turmas, turma];
    }
    setTurmas(novasTurmas);
    storage.saveTurmas(novasTurmas);
  };

  const handleExcluirTurma = (id: string) => {
    const novasTurmas = turmas.filter(t => t.id !== id);
    setTurmas(novasTurmas);
    storage.saveTurmas(novasTurmas);
  };

  // CRUD Alunos
  const handleSaveAluno = (aluno: Aluno) => {
    const exists = alunos.some(a => a.id === aluno.id);
    let novosAlunos: Aluno[];
    if (exists) {
      novosAlunos = alunos.map(a => a.id === aluno.id ? aluno : a);
    } else {
      novosAlunos = [aluno, ...alunos];
    }
    setAlunos(novosAlunos);
    storage.saveAlunos(novosAlunos);
  };

  const handleExcluirAluno = (id: string) => {
    const novosAlunos = alunos.filter(a => a.id !== id);
    setAlunos(novosAlunos);
    storage.saveAlunos(novosAlunos);
  };

  // Ações de Atalho
  const handleAbrirNovoRegistro = () => {
    setRegistroEmEdicao(null);
    setIsModalBuscaOpen(true);
  };

  const handleEditarRegistro = (reg: RegistroBuscaAtiva) => {
    setRegistroEmEdicao(reg);
    setIsModalBuscaOpen(true);
  };

  const handleVisualizarRegistro = (reg: RegistroBuscaAtiva) => {
    setRegistroEmVisualizacao(reg);
    setIsModalDetailsOpen(true);
  };

  const handleIniciarBuscaParaAluno = (aluno: Aluno) => {
    const preReg: Partial<RegistroBuscaAtiva> = {
      alunoId: aluno.id,
      nomeAluno: aluno.nomeCompleto,
      turmaId: aluno.turmaId,
      turma: aluno.turmaNome,
      data: new Date().toISOString().slice(0, 10),
      totalFaltas: 3,
      totalDiasAtestado: 0,
      totalDiasPerdaCargaHoraria: 3,
      descricao: `Iniciada busca ativa para o(a) aluno(a) ${aluno.nomeCompleto}. Ausências reportadas na turma ${aluno.turmaNome}.`,
      retornoBuscaAtiva: `Tentativa de contato com ${aluno.nomeResponsavel} pelo telefone ${aluno.telefoneResponsavel}.`,
      status: 'Em Acompanhamento'
    };
    setRegistroEmEdicao(preReg as RegistroBuscaAtiva);
    setIsModalBuscaOpen(true);
  };

  const handleResetData = () => {
    if (window.confirm('Deseja restaurar os dados de exemplo originais do CEMEI Maria de Lourdes? (Isso recarregará as turmas, alunos e buscas de demonstração)')) {
      storage.resetDefaults();
      setTurmas(storage.getTurmas());
      setAlunos(storage.getAlunos());
      setRegistros(storage.getRegistros());
      setEscolaInfo(storage.getEscolaInfo());
      alert('Dados restaurados com sucesso!');
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased">
      
      {/* Barra de Navegação Superior */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNovoRegistro={handleAbrirNovoRegistro}
        onResetData={handleResetData}
        escolaInfo={escolaInfo}
      />

      {/* Conteúdo Principal de Acordo com a Aba Ativa */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'registros' && (
          <BuscaAtivaTable
            registros={registros}
            turmas={turmas}
            onNovoRegistro={handleAbrirNovoRegistro}
            onEditarRegistro={handleEditarRegistro}
            onVisualizarRegistro={handleVisualizarRegistro}
            onExcluirRegistro={handleExcluirRegistro}
          />
        )}

        {activeTab === 'turmas' && (
          <TurmasAlunosManager
            turmas={turmas}
            alunos={alunos}
            registros={registros}
            onSalvarTurma={handleSaveTurma}
            onExcluirTurma={handleExcluirTurma}
            onSalvarAluno={handleSaveAluno}
            onExcluirAluno={handleExcluirAluno}
            onIniciarBuscaAtivaParaAluno={handleIniciarBuscaParaAluno}
          />
        )}

        {activeTab === 'indicadores' && (
          <PainelIndicadores
            registros={registros}
            turmas={turmas}
            alunos={alunos}
            onVisualizarRegistro={handleVisualizarRegistro}
          />
        )}

        {activeTab === 'relatorio' && (
          <RelatorioOficial
            registros={registros}
            turmas={turmas}
            alunos={alunos}
            escolaInfo={escolaInfo}
          />
        )}
      </main>

      {/* Modais Globais */}
      <BuscaAtivaModal
        isOpen={isModalBuscaOpen}
        onClose={() => {
          setIsModalBuscaOpen(false);
          setRegistroEmEdicao(null);
        }}
        onSave={handleSaveRegistro}
        registroEmEdicao={registroEmEdicao}
        turmas={turmas}
        alunos={alunos}
      />

      <BuscaAtivaDetailsModal
        isOpen={isModalDetailsOpen}
        onClose={() => {
          setIsModalDetailsOpen(false);
          setRegistroEmVisualizacao(null);
        }}
        registro={registroEmVisualizacao}
        onEditar={(reg) => {
          setIsModalDetailsOpen(false);
          handleEditarRegistro(reg);
        }}
        onAtualizarStatus={handleAtualizarStatusRegistro}
      />

      {/* Rodapé institucional */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 text-center sm:text-left">
          <div>
            <strong>{escolaInfo.nome}</strong> • {escolaInfo.semedOrgao}
          </div>
          <div>
            Compatível com Android (Smartphones/Tablets) e Desktop Windows • Sistema de Busca Ativa
          </div>
        </div>
      </footer>

    </div>
  );
}
