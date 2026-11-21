import React, { useMemo, useState } from 'react';
import {
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileCheck2,
  Minus,
  Plus,
  Trash2,
  X,
  MessageSquare,
  UserCog
} from 'lucide-react';
import {
  STATUS_CONFIG,
  formatDateBR,
  formatScore,
  getEffectiveScore,
  registroKey,
  roundScore
} from '../utils/storage';

const FILTROS_SALA = [
  { id: 'todos', label: 'Todos' },
  { id: 'pendentes', label: 'Pendentes' },
  { id: 'nao_fez', label: 'Não fez' },
  { id: 'fez', label: 'Fez' }
];

export default function ClassroomView({
  alunos,
  atividades,
  atividadeAtivaId,
  onSelectAtividade,
  registros,
  onSetRegistro,
  onMarcarTodosFeito,
  onOpenNovaAtividade,
  onEditAtividade,
  onDeleteAtividade,
  onEditAluno
}) {
  const [filtroStatus, setFiltroStatus] = useState('todos');

  const atividadeAtual = useMemo(() => {
    if (!atividades.length) return null;
    return atividades.find((a) => a.id === atividadeAtivaId) || atividades[atividades.length - 1];
  }, [atividades, atividadeAtivaId]);

  const currentIdx = atividadeAtual
    ? atividades.findIndex((a) => a.id === atividadeAtual.id)
    : -1;

  const stats = useMemo(() => {
    if (!atividadeAtual) return { fez: 0, parcial: 0, nao_fez: 0, justificado: 0, pendentes: 0 };
    let fez = 0;
    let parcial = 0;
    let nao_fez = 0;
    let justificado = 0;
    let pendentes = 0;

    for (const aluno of alunos) {
      const reg = registros[registroKey(aluno.id, atividadeAtual.id)];
      if (!reg?.status) pendentes++;
      else if (reg.status === 'fez') fez++;
      else if (reg.status === 'parcial') parcial++;
      else if (reg.status === 'nao_fez') nao_fez++;
      else if (reg.status === 'justificado') justificado++;
    }
    return { fez, parcial, nao_fez, justificado, pendentes };
  }, [alunos, atividadeAtual, registros]);

  const alunosFiltrados = useMemo(() => {
    if (!atividadeAtual) return [];
    if (filtroStatus === 'todos') return alunos;
    return alunos.filter((aluno) => {
      const reg = registros[registroKey(aluno.id, atividadeAtual.id)];
      if (filtroStatus === 'pendentes') return !reg?.status;
      return reg?.status === filtroStatus;
    });
  }, [alunos, atividadeAtual, registros, filtroStatus]);

  if (!atividadeAtual) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm max-w-lg mx-auto mt-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center mb-4">
          <Plus className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Nenhuma atividade selecionável
        </h2>
        <p className="text-sm text-slate-500 mt-1.5 mb-5">
          Crie uma atividade para usar o Modo Sala com cartões grandes e rápidos no seu iPhone ou iPad mini.
        </p>
        <button
          type="button"
          onClick={onOpenNovaAtividade}
          className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 active:scale-95 text-white font-semibold px-5 py-3 rounded-xl shadow-sm transition"
        >
          <Plus className="w-5 h-5" />
          Criar Nova Atividade
        </button>
      </div>
    );
  }

  const avaliados = alunos.length - stats.pendentes;
  const pctConcluido = alunos.length > 0 ? Math.round((avaliados / alunos.length) * 100) : 0;

  const handleToggleStatus = (alunoId, targetStatus) => {
    const reg = registros[registroKey(alunoId, atividadeAtual.id)];
    const nextStatus = reg?.status === targetStatus ? null : targetStatus;
    onSetRegistro(alunoId, atividadeAtual.id, nextStatus, atividadeAtual.valorMax);
  };

  const handleStepScore = (alunoId, delta) => {
    const reg = registros[registroKey(alunoId, atividadeAtual.id)];
    const current = getEffectiveScore(reg, atividadeAtual.valorMax) ?? 0;
    const nextVal = Math.max(0, roundScore(current + delta));
    const max = Number(atividadeAtual.valorMax) || 1;
    let inferredStatus = 'parcial';
    if (nextVal >= max) inferredStatus = 'fez';
    else if (nextVal === 0) inferredStatus = 'nao_fez';
    onSetRegistro(alunoId, atividadeAtual.id, inferredStatus, atividadeAtual.valorMax, {
      nota: nextVal
    });
  };

  const handleScoreInput = (alunoId, rawVal) => {
    const cleaned = rawVal.replace(',', '.');
    if (cleaned === '') {
      onSetRegistro(alunoId, atividadeAtual.id, undefined, atividadeAtual.valorMax, {
        nota: null
      });
      return;
    }
    const parsed = parseFloat(cleaned);
    if (Number.isNaN(parsed) || parsed < 0) return;
    const max = Number(atividadeAtual.valorMax) || 1;
    let inferredStatus = 'parcial';
    if (parsed >= max) inferredStatus = 'fez';
    else if (parsed === 0) inferredStatus = 'nao_fez';
    onSetRegistro(alunoId, atividadeAtual.id, inferredStatus, atividadeAtual.valorMax, {
      nota: parsed
    });
  };

  return (
    <div className="space-y-4">
      {/* Activity Selector & Progress Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3.5 sm:p-4 space-y-3">
        {/* Top Row: Activity Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentIdx <= 0}
            onClick={() => onSelectAtividade(atividades[currentIdx - 1].id)}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-35 transition shrink-0"
            aria-label="Atividade anterior"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>

          <select
            value={atividadeAtual.id}
            onChange={(e) => onSelectAtividade(e.target.value)}
            className="flex-1 min-w-0 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl px-3 py-2.5 text-sm sm:text-base font-bold text-slate-900 outline-none"
          >
            {atividades.map((atv) => (
              <option key={atv.id} value={atv.id}>
                {atv.titulo} ({atv.bimestre}º Bim • {formatDateBR(atv.data)} • Max{' '}
                {formatScore(atv.valorMax)})
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={currentIdx >= atividades.length - 1}
            onClick={() => onSelectAtividade(atividades[currentIdx + 1].id)}
            className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-35 transition shrink-0"
            aria-label="Próxima atividade"
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>

          <button
            type="button"
            onClick={() => onEditAtividade(atividadeAtual)}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition shrink-0"
            title="Editar atividade"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteAtividade(atividadeAtual)}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
            title="Excluir atividade"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar + Quick Counts */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-700">
                {avaliados}/{alunos.length} avaliados ({pctConcluido}%)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                Fez: {stats.fez}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                Parcial: {stats.parcial}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                Não: {stats.nao_fez}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-semibold">
                Just.: {stats.justificado}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onMarcarTodosFeito(atividadeAtual)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold px-3 py-1.5 rounded-xl transition shadow-sm"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Marcar Todos como Feito</span>
            </button>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
            {alunos.length > 0 && (
              <>
                <div
                  className="bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(stats.fez / alunos.length) * 100}%` }}
                />
                <div
                  className="bg-amber-400 transition-all duration-300"
                  style={{ width: `${(stats.parcial / alunos.length) * 100}%` }}
                />
                <div
                  className="bg-rose-500 transition-all duration-300"
                  style={{ width: `${(stats.nao_fez / alunos.length) * 100}%` }}
                />
                <div
                  className="bg-sky-500 transition-all duration-300"
                  style={{ width: `${(stats.justificado / alunos.length) * 100}%` }}
                />
              </>
            )}
          </div>
        </div>

        {/* Status Quick Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          {FILTROS_SALA.map((f) => {
            const active = filtroStatus === f.id;
            const count =
              f.id === 'todos'
                ? alunos.length
                : f.id === 'pendentes'
                ? stats.pendentes
                : stats[f.id];
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFiltroStatus(f.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    active ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tactile Student Cards Grid */}
      {alunosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          Nenhum aluno neste filtro.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-8">
          {alunosFiltrados.map((aluno) => {
            const originalIndex = alunos.findIndex((a) => a.id === aluno.id);
            const reg = registros[registroKey(aluno.id, atividadeAtual.id)];
            const status = reg?.status || null;
            const score = getEffectiveScore(reg, atividadeAtual.valorMax);

            const borderLeftClass =
              status === 'fez'
                ? 'border-l-emerald-500'
                : status === 'parcial'
                ? 'border-l-amber-400'
                : status === 'nao_fez'
                ? 'border-l-rose-500'
                : status === 'justificado'
                ? 'border-l-sky-500'
                : 'border-l-slate-300';

            return (
              <div
                key={aluno.id}
                className={`bg-white rounded-2xl border border-slate-200 border-l-4 ${borderLeftClass} shadow-sm p-3.5 sm:p-4 flex flex-col gap-3`}
              >
                {/* Card Header: Student Identity + Current Score */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {String(originalIndex + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 leading-tight truncate">
                        {aluno.nome}
                      </h3>
                      {aluno.matricula && (
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Mat. {aluno.matricula}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-sm font-bold ${
                        status === 'fez'
                          ? 'bg-emerald-50 text-emerald-700'
                          : status === 'parcial'
                          ? 'bg-amber-50 text-amber-700'
                          : status === 'nao_fez'
                          ? 'bg-rose-50 text-rose-700'
                          : status === 'justificado'
                          ? 'bg-sky-50 text-sky-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {score !== null ? formatScore(score) : status === 'justificado' ? 'Just.' : '—'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEditAluno(aluno)}
                      className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                      title="Editar aluno"
                    >
                      <UserCog className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 4 Large Tactile Status Buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(aluno.id, 'fez')}
                    className={`flex flex-col items-center justify-center gap-0.5 min-h-[52px] rounded-xl border font-bold text-xs transition active:scale-95 ${
                      status === 'fez'
                        ? STATUS_CONFIG.fez.activeButtonClass
                        : STATUS_CONFIG.fez.inactiveButtonClass
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[2.6]" />
                    <span>Fez</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(aluno.id, 'parcial')}
                    className={`flex flex-col items-center justify-center gap-0.5 min-h-[52px] rounded-xl border font-bold text-xs transition active:scale-95 ${
                      status === 'parcial'
                        ? STATUS_CONFIG.parcial.activeButtonClass
                        : STATUS_CONFIG.parcial.inactiveButtonClass
                    }`}
                  >
                    <Minus className="w-4 h-4 stroke-[2.6]" />
                    <span>Parcial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(aluno.id, 'nao_fez')}
                    className={`flex flex-col items-center justify-center gap-0.5 min-h-[52px] rounded-xl border font-bold text-xs transition active:scale-95 ${
                      status === 'nao_fez'
                        ? STATUS_CONFIG.nao_fez.activeButtonClass
                        : STATUS_CONFIG.nao_fez.inactiveButtonClass
                    }`}
                  >
                    <X className="w-4 h-4 stroke-[2.6]" />
                    <span>Não fez</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(aluno.id, 'justificado')}
                    className={`flex flex-col items-center justify-center gap-0.5 min-h-[52px] rounded-xl border font-bold text-xs transition active:scale-95 ${
                      status === 'justificado'
                        ? STATUS_CONFIG.justificado.activeButtonClass
                        : STATUS_CONFIG.justificado.inactiveButtonClass
                    }`}
                  >
                    <FileCheck2 className="w-4 h-4 stroke-[2.2]" />
                    <span>Justif.</span>
                  </button>
                </div>

                {/* Quick Score & Observation Row */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStepScore(aluno.id, -0.5)}
                      className="w-7 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-sm flex items-center justify-center"
                      aria-label="Diminuir 0,5"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      inputMode="decimal"
                      value={score === null ? '' : score}
                      onChange={(e) => handleScoreInput(aluno.id, e.target.value)}
                      placeholder="Nota"
                      className="w-14 h-8 text-center text-xs font-bold bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleStepScore(aluno.id, 0.5)}
                      className="w-7 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-sm flex items-center justify-center"
                      aria-label="Aumentar 0,5"
                    >
                      +
                    </button>
                  </div>

                  <div className="relative flex-1 min-w-0">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={reg?.obs || ''}
                      onChange={(e) =>
                        onSetRegistro(
                          aluno.id,
                          atividadeAtual.id,
                          undefined,
                          atividadeAtual.valorMax,
                          { obs: e.target.value }
                        )
                      }
                      placeholder="Obs. rápida..."
                      className="w-full h-8 pl-8 pr-2.5 text-xs bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg outline-none transition"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
