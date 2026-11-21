import React, { useEffect, useMemo, useState } from 'react';
import { ORDEM_TURMAS, TURMAS_INICIAIS } from './data/turmas2026';
import {
  calcularEstatisticasTurma,
  createInitialData,
  generateId,
  getDefaultScoreForStatus,
  loadAppData,
  normalizeLoadedData,
  registroKey,
  saveAppData
} from './utils/storage';
import { exportBackupJSON, exportTurmaCSV } from './utils/exportUtils';
import Header from './components/Header';
import GridView from './components/GridView';
import ClassroomView from './components/ClassroomView';
import ActivityModal from './components/ActivityModal';
import StudentModal from './components/StudentModal';
import BackupModal from './components/BackupModal';
import PrintReport from './components/PrintReport';

function normalizeSearch(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export default function App() {
  const [appData, setAppData] = useState(() => loadAppData());
  const [turmaAtiva, setTurmaAtiva] = useState(ORDEM_TURMAS[0]);
  const [modoVisualizacao, setModoVisualizacao] = useState('grade'); // 'grade' | 'sala'
  const [bimestreFiltro, setBimestreFiltro] = useState('todos'); // 'todos' | 1 | 2 | 3 | 4
  const [busca, setBusca] = useState('');
  const [atividadeAtivaSalaId, setAtividadeAtivaSalaId] = useState(null);

  // Modals
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [atividadeEditando, setAtividadeEditando] = useState(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [alunoEditandoInicial, setAlunoEditandoInicial] = useState(null);
  const [backupModalOpen, setBackupModalOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  // Persist automatically to localStorage
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  const dadosTurma = appData.turmas[turmaAtiva] || {
    alunos: [],
    atividades: [],
    registros: {}
  };

  const atividadesVisiveis = useMemo(() => {
    const lista = dadosTurma.atividades || [];
    if (bimestreFiltro === 'todos') return lista;
    return lista.filter((a) => Number(a.bimestre) === Number(bimestreFiltro));
  }, [dadosTurma.atividades, bimestreFiltro]);

  // Keep active classroom activity synced when changing class or filter
  useEffect(() => {
    if (!atividadesVisiveis.length) {
      setAtividadeAtivaSalaId(null);
      return;
    }
    const stillExists = atividadesVisiveis.some((a) => a.id === atividadeAtivaSalaId);
    if (!stillExists) {
      setAtividadeAtivaSalaId(atividadesVisiveis[atividadesVisiveis.length - 1].id);
    }
  }, [atividadesVisiveis, atividadeAtivaSalaId]);

  const alunosFiltrados = useMemo(() => {
    const q = normalizeSearch(busca.trim());
    if (!q) return dadosTurma.alunos;
    return dadosTurma.alunos.filter(
      (a) =>
        normalizeSearch(a.nome).includes(q) ||
        normalizeSearch(a.matricula).includes(q)
    );
  }, [dadosTurma.alunos, busca]);

  const estatisticasTurma = useMemo(
    () =>
      calcularEstatisticasTurma(
        dadosTurma.alunos,
        atividadesVisiveis,
        dadosTurma.registros
      ),
    [dadosTurma.alunos, atividadesVisiveis, dadosTurma.registros]
  );

  const bimestreLabel =
    bimestreFiltro === 'todos' ? 'Todos os Bimestres' : `${bimestreFiltro}º Bimestre`;

  // Update a student's record for an activity
  const handleSetRegistro = (
    alunoId,
    atividadeId,
    nextStatus,
    valorMax,
    overrides = {}
  ) => {
    setAppData((prev) => {
      const turma = prev.turmas[turmaAtiva];
      if (!turma) return prev;
      const key = registroKey(alunoId, atividadeId);
      const existing = turma.registros[key] || { status: null, nota: null, obs: '' };

      const finalStatus =
        nextStatus === undefined ? existing.status : nextStatus;

      let finalNota;
      if ('nota' in overrides) {
        finalNota = overrides.nota;
      } else if (nextStatus !== undefined) {
        finalNota = getDefaultScoreForStatus(finalStatus, valorMax);
      } else {
        finalNota = existing.nota;
      }

      const finalObs = 'obs' in overrides ? overrides.obs : existing.obs || '';

      const nextRegistros = { ...turma.registros };
      if (!finalStatus && finalNota === null && !finalObs) {
        delete nextRegistros[key];
      } else {
        nextRegistros[key] = {
          status: finalStatus,
          nota: finalNota,
          obs: finalObs
        };
      }

      return {
        ...prev,
        turmas: {
          ...prev.turmas,
          [turmaAtiva]: {
            ...turma,
            registros: nextRegistros
          }
        }
      };
    });
  };

  // Mark all visible students as "Fez" (100%)
  const handleMarcarTodosFeito = (atividade) => {
    setAppData((prev) => {
      const turma = prev.turmas[turmaAtiva];
      if (!turma) return prev;
      const nextRegistros = { ...turma.registros };
      const targets = alunosFiltrados.length > 0 ? alunosFiltrados : turma.alunos;

      for (const aluno of targets) {
        const key = registroKey(aluno.id, atividade.id);
        const existing = nextRegistros[key] || {};
        nextRegistros[key] = {
          ...existing,
          status: 'fez',
          nota: getDefaultScoreForStatus('fez', atividade.valorMax),
          obs: existing.obs || ''
        };
      }

      return {
        ...prev,
        turmas: {
          ...prev.turmas,
          [turmaAtiva]: {
            ...turma,
            registros: nextRegistros
          }
        }
      };
    });
    showToast(`Todos marcados como Fez em "${atividade.titulo}"`);
  };

  // Save new or edited activity (with optional replication)
  const handleSaveAtividade = ({
    id,
    titulo,
    data,
    valorMax,
    bimestre,
    turmasReplicar
  }) => {
    if (id) {
      // Edit existing activity in current class
      setAppData((prev) => {
        const turma = prev.turmas[turmaAtiva];
        if (!turma) return prev;
        return {
          ...prev,
          turmas: {
            ...prev.turmas,
            [turmaAtiva]: {
              ...turma,
              atividades: turma.atividades.map((a) =>
                a.id === id ? { ...a, titulo, data, valorMax, bimestre } : a
              )
            }
          }
        };
      });
      showToast('Atividade atualizada.');
      return;
    }

    const newMainId = generateId('atv');
    const destinos = [turmaAtiva, ...(turmasReplicar || [])];

    setAppData((prev) => {
      const nextTurmas = { ...prev.turmas };
      destinos.forEach((nomeTurma, idx) => {
        const t = nextTurmas[nomeTurma];
        if (!t) return;
        const atvId = idx === 0 ? newMainId : generateId('atv');
        nextTurmas[nomeTurma] = {
          ...t,
          atividades: [
            ...t.atividades,
            {
              id: atvId,
              titulo,
              data,
              valorMax,
              bimestre
            }
          ]
        };
      });
      return { ...prev, turmas: nextTurmas };
    });

    if (bimestreFiltro !== 'todos' && Number(bimestreFiltro) !== Number(bimestre)) {
      setBimestreFiltro(Number(bimestre));
    }
    setAtividadeAtivaSalaId(newMainId);

    showToast(
      destinos.length > 1
        ? `Atividade criada em ${destinos.length} turmas!`
        : `Atividade "${titulo}" criada!`
    );
  };

  const handleDeleteAtividade = (atividade) => {
    if (
      !window.confirm(
        `Excluir a atividade "${atividade.titulo}" e todas as notas lançadas nela na turma ${turmaAtiva}?`
      )
    ) {
      return;
    }

    setAppData((prev) => {
      const turma = prev.turmas[turmaAtiva];
      if (!turma) return prev;
      const nextRegistros = { ...turma.registros };
      const suffix = `__${atividade.id}`;
      for (const k of Object.keys(nextRegistros)) {
        if (k.endsWith(suffix)) {
          delete nextRegistros[k];
        }
      }
      return {
        ...prev,
        turmas: {
          ...prev.turmas,
          [turmaAtiva]: {
            ...turma,
            atividades: turma.atividades.filter((a) => a.id !== atividade.id),
            registros: nextRegistros
          }
        }
      };
    });
    showToast(`Atividade "${atividade.titulo}" excluída.`);
  };

  // Student CRUD
  const handleAddAluno = ({ nome, matricula }) => {
    const novoAluno = {
      id: matricula || generateId('alu'),
      matricula: matricula || '',
      nome
    };
    setAppData((prev) => {
      const turma = prev.turmas[turmaAtiva];
      if (!turma) return prev;
      const nextAlunos = [...turma.alunos, novoAluno].sort((a, b) =>
        a.nome.localeCompare(b.nome, 'pt-BR')
      );
      return {
        ...prev,
        turmas: {
          ...prev.turmas,
          [turmaAtiva]: {
            ...turma,
            alunos: nextAlunos
          }
        }
      };
    });
    showToast(`Aluno "${nome}" adicionado à turma ${turmaAtiva}.`);
  };

  const handleAddLote = (lista) => {
    setAppData((prev) => {
      const turma = prev.turmas[turmaAtiva];
      if (!turma) return prev;
      const novos = lista.map((item) => ({
        id: item.matricula || generateId('alu'),
        matricula: item.matricula || '',
        nome: item.nome
      }));
      const nextAlunos = [...turma.alunos, ...novos].sort((a, b) =>
        a.nome.localeCompare(b.nome, 'pt-BR')
      );
      return {
        ...prev,
        turmas: {
          ...prev.turmas,
          [turmaAtiva]: {
            ...turma,
            alunos: nextAlunos
          }
        }
      };
    });
    showToast(`${lista.length} aluno(s) adicionados à turma ${turmaAtiva}.`);
  };

  const handleUpdateAluno = (alunoId, { nome, matricula }) => {
    setAppData((prev) => {
      const turma = prev.turmas[turmaAtiva];
      if (!turma) return prev;
      const nextAlunos = turma.alunos
        .map((a) => (a.id === alunoId ? { ...a, nome, matricula } : a))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      return {
        ...prev,
        turmas: {
          ...prev.turmas,
          [turmaAtiva]: {
            ...turma,
            alunos: nextAlunos
          }
        }
      };
    });
    showToast('Dados do aluno atualizados.');
  };

  const handleRemoveAluno = (alunoId) => {
    setAppData((prev) => {
      const turma = prev.turmas[turmaAtiva];
      if (!turma) return prev;
      const nextRegistros = { ...turma.registros };
      const prefix = `${alunoId}__`;
      for (const k of Object.keys(nextRegistros)) {
        if (k.startsWith(prefix)) delete nextRegistros[k];
      }
      return {
        ...prev,
        turmas: {
          ...prev.turmas,
          [turmaAtiva]: {
            ...turma,
            alunos: turma.alunos.filter((a) => a.id !== alunoId),
            registros: nextRegistros
          }
        }
      };
    });
    showToast('Aluno removido da turma.');
  };

  // Backup / Restore / Export
  const handleExportJSON = () => {
    exportBackupJSON(appData);
    showToast('Backup JSON exportado!');
  };

  const handleImportJSON = (parsed) => {
    const normalized = normalizeLoadedData(parsed);
    setAppData(normalized);
    showToast('Backup restaurado com sucesso!');
  };

  const handleExportCSV = () => {
    exportTurmaCSV(turmaAtiva, dadosTurma, atividadesVisiveis, bimestreLabel);
    showToast(`Boletim CSV da turma ${turmaAtiva} exportado!`);
  };

  const handleRestoreRealClasses = (mode) => {
    if (mode === 'full') {
      setAppData(createInitialData());
      showToast('Todas as 12 turmas reais de 2026 foram restauradas!');
      return;
    }

    // Safe sync: restore real students while keeping existing activities & grades
    setAppData((prev) => {
      const nextTurmas = { ...prev.turmas };
      for (const nomeTurma of ORDEM_TURMAS) {
        const lista = TURMAS_INICIAIS[nomeTurma] || [];
        const atual = nextTurmas[nomeTurma] || { atividades: [], registros: {} };
        nextTurmas[nomeTurma] = {
          ...atual,
          alunos: lista.map((a) => ({
            id: a.matricula,
            matricula: a.matricula,
            nome: a.nome
          }))
        };
      }
      return {
        ...prev,
        turmas: nextTurmas
      };
    });
    showToast('Lista oficial de alunos 2026 restaurada (notas mantidas)!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pb-safe">
      {/* Main Interactive App */}
      <Header
        turmasData={appData.turmas}
        turmaAtiva={turmaAtiva}
        onSelectTurma={(t) => {
          setTurmaAtiva(t);
          setBusca('');
        }}
        modoVisualizacao={modoVisualizacao}
        onChangeModo={setModoVisualizacao}
        bimestreFiltro={bimestreFiltro}
        onChangeBimestre={setBimestreFiltro}
        busca={busca}
        onChangeBusca={setBusca}
        totalAlunos={dadosTurma.alunos.length}
        totalAtividades={atividadesVisiveis.length}
        estatisticas={estatisticasTurma}
        onOpenNovaAtividade={() => {
          setAtividadeEditando(null);
          setActivityModalOpen(true);
        }}
        onOpenAlunos={() => {
          setAlunoEditandoInicial(null);
          setStudentModalOpen(true);
        }}
        onOpenBackup={() => setBackupModalOpen(true)}
        onPrint={() => window.print()}
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-5 py-3 sm:py-4 no-print">
        {modoVisualizacao === 'grade' ? (
          <GridView
            alunos={alunosFiltrados}
            todosAlunosCount={dadosTurma.alunos.length}
            atividades={atividadesVisiveis}
            registros={dadosTurma.registros}
            onSetRegistro={handleSetRegistro}
            onMarcarTodosFeito={handleMarcarTodosFeito}
            onEditAtividade={(atv) => {
              setAtividadeEditando(atv);
              setActivityModalOpen(true);
            }}
            onDeleteAtividade={handleDeleteAtividade}
            onOpenNovaAtividade={() => {
              setAtividadeEditando(null);
              setActivityModalOpen(true);
            }}
            onEditAluno={(aluno) => {
              setAlunoEditandoInicial(aluno);
              setStudentModalOpen(true);
            }}
          />
        ) : (
          <ClassroomView
            alunos={alunosFiltrados}
            atividades={atividadesVisiveis}
            atividadeAtivaId={atividadeAtivaSalaId}
            onSelectAtividade={setAtividadeAtivaSalaId}
            registros={dadosTurma.registros}
            onSetRegistro={handleSetRegistro}
            onMarcarTodosFeito={handleMarcarTodosFeito}
            onOpenNovaAtividade={() => {
              setAtividadeEditando(null);
              setActivityModalOpen(true);
            }}
            onEditAtividade={(atv) => {
              setAtividadeEditando(atv);
              setActivityModalOpen(true);
            }}
            onDeleteAtividade={handleDeleteAtividade}
            onEditAluno={(aluno) => {
              setAlunoEditandoInicial(aluno);
              setStudentModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Clean Printable Report (visible only in @media print) */}
      <PrintReport
        nomeTurma={turmaAtiva}
        turmaData={dadosTurma}
        atividadesVisiveis={atividadesVisiveis}
        bimestreLabel={bimestreLabel}
      />

      {/* Modals */}
      <ActivityModal
        isOpen={activityModalOpen}
        onClose={() => {
          setActivityModalOpen(false);
          setAtividadeEditando(null);
        }}
        turmaAtiva={turmaAtiva}
        turmasData={appData.turmas}
        bimestrePadrao={bimestreFiltro}
        atividadeEditando={atividadeEditando}
        onSave={handleSaveAtividade}
      />

      <StudentModal
        isOpen={studentModalOpen}
        onClose={() => {
          setStudentModalOpen(false);
          setAlunoEditandoInicial(null);
        }}
        turmaAtiva={turmaAtiva}
        alunos={dadosTurma.alunos}
        alunoEditandoInicial={alunoEditandoInicial}
        onAddAluno={handleAddAluno}
        onAddLote={handleAddLote}
        onUpdateAluno={handleUpdateAluno}
        onRemoveAluno={handleRemoveAluno}
      />

      <BackupModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
        appData={appData}
        turmaAtiva={turmaAtiva}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onExportCSV={handleExportCSV}
        onPrint={() => window.print()}
        onRestoreRealClasses={handleRestoreRealClasses}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 no-print px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm font-semibold shadow-xl border border-white/10 whitespace-nowrap max-w-[92vw] truncate">
          {toast}
        </div>
      )}
    </div>
  );
}
