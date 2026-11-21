import React, { useEffect, useState } from 'react';
import { X, Copy, Calendar, Award, Layers } from 'lucide-react';
import { ORDEM_TURMAS } from '../data/turmas2026';
import { getTodayISO, getTurmasMesmoAno } from '../utils/storage';

const PRESET_VALORES = [0.5, 1.0, 2.0, 5.0, 10.0];

export default function ActivityModal({
  isOpen,
  onClose,
  turmaAtiva,
  turmasData,
  bimestrePadrao,
  atividadeEditando,
  onSave
}) {
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState(getTodayISO());
  const [valorMax, setValorMax] = useState('1.0');
  const [bimestre, setBimestre] = useState(1);
  const [turmasReplicar, setTurmasReplicar] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    if (atividadeEditando) {
      setTitulo(atividadeEditando.titulo || '');
      setData(atividadeEditando.data || getTodayISO());
      setValorMax(String(atividadeEditando.valorMax ?? 1));
      setBimestre(Number(atividadeEditando.bimestre) || 1);
      setTurmasReplicar([]);
    } else {
      setTitulo('');
      setData(getTodayISO());
      setValorMax('1.0');
      setBimestre(typeof bimestrePadrao === 'number' ? bimestrePadrao : 1);
      setTurmasReplicar([]);
    }
  }, [isOpen, atividadeEditando, bimestrePadrao]);

  if (!isOpen) return null;

  const outrasTurmas = ORDEM_TURMAS.filter((t) => t !== turmaAtiva);
  const mesmoAno = getTurmasMesmoAno(turmaAtiva);

  const toggleTurma = (nomeTurma) => {
    setTurmasReplicar((prev) =>
      prev.includes(nomeTurma)
        ? prev.filter((t) => t !== nomeTurma)
        : [...prev, nomeTurma]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const tituloLimpo = titulo.trim();
    if (!tituloLimpo) return;
    const valorNum = parseFloat(String(valorMax).replace(',', '.'));
    if (Number.isNaN(valorNum) || valorNum <= 0) return;

    onSave({
      id: atividadeEditando?.id || null,
      titulo: tituloLimpo,
      data: data || getTodayISO(),
      valorMax: valorNum,
      bimestre: Number(bimestre) || 1,
      turmasReplicar: atividadeEditando ? [] : turmasReplicar
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {atividadeEditando ? 'Editar Atividade' : 'Nova Atividade'}
            </h2>
            <p className="text-xs text-slate-500">
              Turma principal: <strong className="text-blue-900">{turmaAtiva}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Título */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Título da Atividade *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Visto no caderno, Lista Cap. 3, Trabalho em grupo..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl outline-none transition"
            />
          </div>

          {/* Data e Valor Máximo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Data
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl outline-none transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                <Award className="w-3.5 h-3.5" />
                Valor Máximo
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                inputMode="decimal"
                value={valorMax}
                onChange={(e) => setValorMax(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-semibold bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl outline-none transition"
              />
            </div>
          </div>

          {/* Quick Score Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 mr-1">Valores rápidos:</span>
            {PRESET_VALORES.map((val) => {
              const active = Number(valorMax) === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setValorMax(val.toFixed(1))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                    active
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {val.toFixed(1).replace('.', ',')}
                </button>
              );
            })}
          </div>

          {/* Bimestre */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              <Layers className="w-3.5 h-3.5" />
              Bimestre
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBimestre(b)}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition active:scale-95 ${
                    bimestre === b
                      ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {b}º Bim
                </button>
              ))}
            </div>
          </div>

          {/* Replicar para outras turmas (somente na criação) */}
          {!atividadeEditando && (
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Copy className="w-3.5 h-3.5 text-blue-700" />
                  Replicar para outras turmas
                </label>

                <div className="flex items-center gap-1.5 text-[11px]">
                  {mesmoAno.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setTurmasReplicar(mesmoAno)}
                      className="px-2 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 font-semibold transition"
                    >
                      Mesmo ano ({mesmoAno.join(', ')})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setTurmasReplicar(outrasTurmas)}
                    className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition"
                  >
                    Todas
                  </button>
                  {turmasReplicar.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setTurmasReplicar([])}
                      className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold transition"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {outrasTurmas.map((nomeTurma) => {
                  const checked = turmasReplicar.includes(nomeTurma);
                  const count = turmasData[nomeTurma]?.alunos?.length ?? 0;
                  return (
                    <label
                      key={nomeTurma}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition select-none ${
                        checked
                          ? 'bg-blue-50 border-blue-500 text-blue-950'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTurma(nomeTurma)}
                        className="rounded border-slate-300 text-blue-900 focus:ring-blue-500"
                      />
                      <span className="truncate">{nomeTurma}</span>
                      <span className="ml-auto text-[10px] text-slate-400">
                        {count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-bold bg-blue-900 hover:bg-blue-800 active:scale-95 text-white rounded-xl shadow-sm transition"
            >
              {atividadeEditando
                ? 'Salvar Alterações'
                : turmasReplicar.length > 0
                ? `Criar em ${1 + turmasReplicar.length} turmas`
                : 'Criar Atividade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
