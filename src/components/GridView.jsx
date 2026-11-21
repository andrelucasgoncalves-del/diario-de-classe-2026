import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  Edit3,
  Trash2,
  Plus,
  Minus,
  X,
  FileCheck2,
  MessageSquare,
  UserCog
} from 'lucide-react';
import {
  STATUS_CONFIG,
  calcularResumoAluno,
  formatDateBR,
  formatScore,
  getEffectiveScore,
  getNextStatus,
  registroKey
} from '../utils/storage';

function StatusIcon({ status }) {
  if (status === 'fez') return <Check className="w-3.5 h-3.5 stroke-[2.8]" />;
  if (status === 'parcial') return <Minus className="w-3.5 h-3.5 stroke-[2.8]" />;
  if (status === 'nao_fez') return <X className="w-3.5 h-3.5 stroke-[2.8]" />;
  if (status === 'justificado') return <FileCheck2 className="w-3.5 h-3.5 stroke-[2.3]" />;
  return <span className="w-2 h-2 rounded-full bg-slate-300" />;
}

export default function GridView({
  alunos,
  todosAlunosCount,
  atividades,
  registros,
  onSetRegistro,
  onMarcarTodosFeito,
  onEditAtividade,
  onDeleteAtividade,
  onOpenNovaAtividade,
  onEditAluno
}) {
  const [editingObs, setEditingObs] = useState(null); // { alunoId, atividadeId, alunoNome, atvTitulo, text }

  const handleCycleStatus = (alunoId, atividade) => {
    const key = registroKey(alunoId, atividade.id);
    const current = registros[key];
    const nextStatus = getNextStatus(current?.status || null);
    onSetRegistro(alunoId, atividade.id, nextStatus, atividade.valorMax);
  };

  const handleScoreChange = (alunoId, atividade, rawVal) => {
    const cleaned = rawVal.replace(',', '.');
    if (cleaned === '') {
      onSetRegistro(alunoId, atividade.id, undefined, atividade.valorMax, { nota: null });
      return;
    }
    const parsed = parseFloat(cleaned);
    if (Number.isNaN(parsed) || parsed < 0) return;

    const max = Number(atividade.valorMax) || 1;
    let inferredStatus = 'parcial';
    if (parsed >= max) inferredStatus = 'fez';
    else if (parsed === 0) inferredStatus = 'nao_fez';

    onSetRegistro(alunoId, atividade.id, inferredStatus, atividade.valorMax, { nota: parsed });
  };

  const handleSaveObs = (e) => {
    e.preventDefault();
    if (!editingObs) return;
    onSetRegistro(editingObs.alunoId, editingObs.atividadeId, undefined, 0, {
      obs: editingObs.text.trim()
    });
    setEditingObs(null);
  };

  if (alunos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <p className="text-slate-600 font-medium">
          {todosAlunosCount === 0
            ? 'Nenhum aluno cadastrado nesta turma.'
            : 'Nenhum aluno encontrado para a busca digitada.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend & Hint */}
      {atividades.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 px-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-700">Toque rápido:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">
              <Check className="w-3 h-3" /> Fez (100%)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-medium">
              <Minus className="w-3 h-3" /> Parcial (50%)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-medium">
              <X className="w-3 h-3" /> Não fez (0%)
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-medium">
              <FileCheck2 className="w-3 h-3" /> Justificado
            </span>
          </div>
          <span className="text-slate-400 hidden sm:inline">
            Toque no selo para alternar status ou digite a nota diretamente
          </span>
        </div>
      )}

      {/* Spreadsheet Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-230px)]">
          <table className="w-full border-collapse text-left">
            <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-200">
              <tr>
                {/* Sticky Left Column Header */}
                <th className="sticky left-0 z-30 bg-slate-100 px-3 py-2.5 min-w-[175px] sm:min-w-[230px] border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Aluno ({alunos.length})
                    </span>
                  </div>
                </th>

                {/* Activity Columns */}
                {atividades.length === 0 ? (
                  <th className="px-6 py-4 text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <span className="text-sm font-medium text-slate-500">
                        Nenhuma atividade neste filtro ainda.
                      </span>
                      <button
                        type="button"
                        onClick={onOpenNovaAtividade}
                        className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Criar primeira atividade
                      </button>
                    </div>
                  </th>
                ) : (
                  atividades.map((atv) => {
                    const feitosCount = alunos.filter(
                      (a) => registros[registroKey(a.id, atv.id)]?.status === 'fez'
                    ).length;

                    return (
                      <th
                        key={atv.id}
                        className="px-2.5 py-2 min-w-[148px] max-w-[180px] border-r border-slate-200 align-top"
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-start justify-between gap-1">
                            <span
                              className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug"
                              title={atv.titulo}
                            >
                              {atv.titulo}
                            </span>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => onEditAtividade(atv)}
                                className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-md transition"
                                title="Editar atividade"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteAtividade(atv)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                                title="Excluir atividade"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span className="bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.5 rounded">
                              {atv.bimestre}ºB
                            </span>
                            <span>{formatDateBR(atv.data)}</span>
                            <span className="ml-auto font-semibold text-slate-700">
                              Max {formatScore(atv.valorMax)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onMarcarTodosFeito(atv)}
                            className="w-full inline-flex items-center justify-center gap-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-800 border border-emerald-200 rounded-lg py-1 px-2 transition"
                            title="Marcar todos os alunos visíveis como Fez (100%)"
                          >
                            <CheckCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>Todos Fez</span>
                            <span className="text-[10px] text-emerald-700/80">
                              ({feitosCount}/{alunos.length})
                            </span>
                          </button>
                        </div>
                      </th>
                    );
                  })
                )}

                {/* Summary Column Header */}
                {atividades.length > 0 && (
                  <th className="px-3 py-2.5 min-w-[112px] bg-slate-100 text-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                      Soma / Média
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Acumulado
                    </span>
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {alunos.map((aluno, index) => {
                const resumo = calcularResumoAluno(aluno, atividades, registros);

                return (
                  <tr
                    key={aluno.id}
                    className="group hover:bg-blue-50/40 transition-colors"
                  >
                    {/* Sticky Student Name Cell */}
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-blue-50/90 px-3 py-2 border-r border-slate-200 shadow-[2px_0_6px_-2px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[11px] font-bold text-slate-400 w-5 text-right shrink-0">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                              {aluno.nome}
                            </p>
                            {aluno.matricula && (
                              <p className="text-[10px] text-slate-400 font-mono">
                                {aluno.matricula}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onEditAluno(aluno)}
                          className="opacity-40 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-100/60 rounded-lg transition shrink-0"
                          title="Editar ou remover aluno"
                        >
                          <UserCog className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Activity Cells */}
                    {atividades.length === 0 ? (
                      <td className="px-4 py-2 text-center text-xs text-slate-300">—</td>
                    ) : (
                      atividades.map((atv) => {
                        const key = registroKey(aluno.id, atv.id);
                        const reg = registros[key];
                        const status = reg?.status || null;
                        const statusCfg = status ? STATUS_CONFIG[status] : null;
                        const score = getEffectiveScore(reg, atv.valorMax);
                        const hasObs = Boolean(reg?.obs && reg.obs.trim());

                        return (
                          <td
                            key={atv.id}
                            className="px-2 py-1.5 border-r border-slate-100 align-middle"
                          >
                            <div className="flex items-center gap-1.5">
                              {/* 1-tap Status Button */}
                              <button
                                type="button"
                                onClick={() => handleCycleStatus(aluno.id, atv)}
                                className={`flex-1 inline-flex items-center justify-center gap-1 h-8 px-2 rounded-lg border text-xs font-semibold transition active:scale-95 ${
                                  statusCfg
                                    ? statusCfg.badgeClass
                                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
                                }`}
                                title="Toque para alternar: Fez → Parcial → Não fez → Justificado"
                              >
                                <StatusIcon status={status} />
                                <span>{statusCfg ? statusCfg.shortLabel : '—'}</span>
                              </button>

                              {/* Direct Numeric Score Input */}
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                inputMode="decimal"
                                value={score === null ? '' : score}
                                onChange={(e) =>
                                  handleScoreChange(aluno.id, atv, e.target.value)
                                }
                                placeholder="0.0"
                                className="w-12 h-8 text-center text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-lg outline-none transition"
                                aria-label={`Nota de ${aluno.nome} em ${atv.titulo}`}
                              />

                              {/* Quick Note Button */}
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingObs({
                                    alunoId: aluno.id,
                                    atividadeId: atv.id,
                                    alunoNome: aluno.nome,
                                    atvTitulo: atv.titulo,
                                    text: reg?.obs || ''
                                  })
                                }
                                className={`p-1 rounded-md transition shrink-0 ${
                                  hasObs
                                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                                    : 'text-slate-300 hover:text-slate-500 opacity-60 group-hover:opacity-100'
                                }`}
                                title={hasObs ? `Obs: ${reg.obs}` : 'Adicionar observação'}
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        );
                      })
                    )}

                    {/* Final Accumulated Score Column */}
                    {atividades.length > 0 && (
                      <td className="px-2.5 py-1.5 text-center bg-slate-50/70">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-slate-800">
                            {formatScore(resumo.totalObtido)}
                            <span className="text-[10px] font-normal text-slate-400">
                              /{formatScore(resumo.totalPossivel)}
                            </span>
                          </span>
                          <span
                            className={`mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              resumo.media10 === null
                                ? 'bg-slate-200 text-slate-500'
                                : resumo.media10 >= 7
                                ? 'bg-emerald-100 text-emerald-800'
                                : resumo.media10 >= 5
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {resumo.media10 !== null
                              ? `M ${formatScore(resumo.media10)} (${resumo.percentual}%)`
                              : '—'}
                          </span>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inline Observation Modal */}
      {editingObs && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditingObs(null)}
        >
          <form
            onSubmit={handleSaveObs}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Observação do Aluno
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {editingObs.alunoNome} • {editingObs.atvTitulo}
              </p>
            </div>
            <textarea
              rows={3}
              autoFocus
              value={editingObs.text}
              onChange={(e) =>
                setEditingObs((prev) => ({ ...prev, text: e.target.value }))
              }
              placeholder="Ex: Trouxe atestado, entregou com atraso, excelente participação..."
              className="w-full p-3 text-sm bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-500 rounded-xl outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingObs(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded-xl transition"
              >
                Salvar observação
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
