import React from 'react';
import {
  BookOpenCheck,
  Plus,
  Users,
  Database,
  Printer,
  Table2,
  ClipboardCheck,
  Search,
  X,
  CheckCircle2
} from 'lucide-react';
import { ORDEM_TURMAS } from '../data/turmas2026';
import { formatScore } from '../utils/storage';

const BIMESTRES = [
  { value: 'todos', label: 'Todos' },
  { value: 1, label: '1º Bim' },
  { value: 2, label: '2º Bim' },
  { value: 3, label: '3º Bim' },
  { value: 4, label: '4º Bim' }
];

export default function Header({
  turmasData,
  turmaAtiva,
  onSelectTurma,
  modoVisualizacao,
  onChangeModo,
  bimestreFiltro,
  onChangeBimestre,
  busca,
  onChangeBusca,
  totalAlunos,
  totalAtividades,
  estatisticas,
  onOpenNovaAtividade,
  onOpenAlunos,
  onOpenBackup,
  onPrint
}) {
  return (
    <header className="sticky top-0 z-30 no-print shadow-sm">
      {/* Top Institutional Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white pt-safe">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 pt-2.5 pb-2">
          <div className="flex items-center justify-between gap-2">
            {/* Brand */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                <BookOpenCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold tracking-tight truncate">
                    Diário de Classe
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-400/25 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Salvo local
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-blue-200/85 truncate">
                  EREFEM Pedro Pires Ferreira • 2026
                </p>
              </div>
            </div>

            {/* Primary Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenNovaAtividade}
                className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-semibold text-xs sm:text-sm px-2.5 sm:px-3.5 py-2 rounded-xl transition shadow-sm"
                title="Criar nova atividade"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Nova Atividade</span>
                <span className="sm:hidden">Nova</span>
              </button>

              <button
                type="button"
                onClick={onOpenAlunos}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-2 rounded-xl border border-white/10 transition"
                title="Gerenciar alunos da turma"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Alunos</span>
              </button>

              <button
                type="button"
                onClick={onOpenBackup}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-2 rounded-xl border border-white/10 transition"
                title="Backup JSON, CSV e Restauração"
              >
                <Database className="w-4 h-4" />
                <span className="hidden md:inline">Backup / CSV</span>
              </button>

              <button
                type="button"
                onClick={onPrint}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs sm:text-sm font-medium p-2 sm:px-3 rounded-xl border border-white/10 transition"
                title="Imprimir / PDF limpo da turma"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden lg:inline">Imprimir</span>
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable 12-Class Selector */}
          <div className="mt-2.5 -mx-3 sm:-mx-5 px-3 sm:px-5 pb-1 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 min-w-max">
              {ORDEM_TURMAS.map((nomeTurma) => {
                const isActive = nomeTurma === turmaAtiva;
                const count = turmasData[nomeTurma]?.alunos?.length ?? 0;
                return (
                  <button
                    key={nomeTurma}
                    type="button"
                    onClick={() => onSelectTurma(nomeTurma)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition active:scale-95 whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-blue-950 shadow-md'
                        : 'bg-white/10 text-blue-100 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    <span>{nomeTurma}</span>
                    <span
                      className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-black/25 text-blue-100'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-header: Active Class Summary, Mode Switcher, Bimestre & Search */}
      <div className="bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-2 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Summary Metrics */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-slate-900">
                {turmaAtiva}
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-medium px-2 py-1 rounded-lg">
                  <strong className="text-slate-900">{totalAlunos}</strong> alunos
                </span>
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-medium px-2 py-1 rounded-lg">
                  <strong className="text-slate-900">{totalAtividades}</strong> ativ.
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-semibold px-2 py-1 rounded-lg ${
                    estatisticas.mediaGeral10 === null
                      ? 'bg-slate-100 text-slate-500'
                      : estatisticas.mediaGeral10 >= 7
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : estatisticas.mediaGeral10 >= 5
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  Média:{' '}
                  <strong>
                    {estatisticas.mediaGeral10 !== null
                      ? formatScore(estatisticas.mediaGeral10)
                      : '—'}
                  </strong>
                </span>
              </div>
            </div>

            {/* 1-Tap View Mode Toggle */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => onChangeModo('grade')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                  modoVisualizacao === 'grade'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table2 className="w-4 h-4" />
                <span>Modo Grade</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeModo('sala')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                  modoVisualizacao === 'sala'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Modo Sala</span>
              </button>
            </div>
          </div>

          {/* Second Row: Bimestre Filter + Quick Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            {/* Bimestre Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {BIMESTRES.map((bim) => {
                const active = bimestreFiltro === bim.value;
                return (
                  <button
                    key={String(bim.value)}
                    type="button"
                    onClick={() => onChangeBimestre(bim.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                      active
                        ? 'bg-blue-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {bim.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Student Search */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={busca}
                onChange={(e) => onChangeBusca(e.target.value)}
                placeholder="Buscar aluno ou matrícula..."
                className="w-full pl-9 pr-8 py-1.5 text-sm bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl outline-none transition"
              />
              {busca && (
                <button
                  type="button"
                  onClick={() => onChangeBusca('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
