import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  Printer,
  RotateCcw,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { ORDEM_TURMAS } from '../data/turmas2026';

export default function BackupModal({
  isOpen,
  onClose,
  appData,
  turmaAtiva,
  onExportJSON,
  onImportJSON,
  onExportCSV,
  onPrint,
  onRestoreRealClasses
}) {
  const fileInputRef = useRef(null);
  const [confirmResetMode, setConfirmResetMode] = useState(null); // null | 'sync' | 'full'

  if (!isOpen) return null;

  const totalAlunosGeral = ORDEM_TURMAS.reduce(
    (acc, t) => acc + (appData.turmas[t]?.alunos?.length || 0),
    0
  );
  const totalAtividadesGeral = ORDEM_TURMAS.reduce(
    (acc, t) => acc + (appData.turmas[t]?.atividades?.length || 0),
    0
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target?.result || ''));
        onImportJSON(parsed);
        onClose();
      } catch {
        window.alert('Arquivo JSON inválido. Selecione um backup gerado por este aplicativo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
              Dados, Backup e Exportação
            </h2>
            <p className="text-xs text-slate-500">
              {totalAlunosGeral} alunos nas 12 turmas • {totalAtividadesGeral} atividades lançadas
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions */}
        <div className="p-5 space-y-3 overflow-y-auto">
          {/* Backup JSON */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onExportJSON}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-left transition active:scale-[0.99]"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Exportar Backup</p>
                <p className="text-xs text-slate-600">Arquivo .JSON completo</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition active:scale-[0.99]"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Restaurar Backup</p>
                <p className="text-xs text-slate-600">Importar arquivo .JSON</p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Boletim CSV + Imprimir */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                onExportCSV();
                onClose();
              }}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-left transition active:scale-[0.99]"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Boletim (CSV)</p>
                <p className="text-xs text-slate-600">Turma {turmaAtiva} (Excel)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                setTimeout(() => onPrint(), 150);
              }}
              className="flex items-center gap-3 p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-left transition active:scale-[0.99]"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Imprimir / PDF</p>
                <p className="text-xs text-slate-600">Relatório limpo {turmaAtiva}</p>
              </div>
            </button>
          </div>

          {/* Restaurar Turmas Reais 2026 */}
          <div className="pt-3 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Turmas Reais 2026
            </div>

            {!confirmResetMode ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setConfirmResetMode('sync')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 text-left transition"
                >
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-amber-950">
                      Restaurar lista oficial de alunos (manter notas)
                    </p>
                    <p className="text-[11px] text-amber-800/80">
                      Recompõe todos os alunos reais de 2026 preservando suas atividades e notas já lançadas.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmResetMode('full')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 text-left transition"
                >
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-rose-950">
                      Reset completo para Turmas Reais 2026
                    </p>
                    <p className="text-[11px] text-rose-800/80">
                      Apaga todas as atividades e notas e volta ao estado inicial limpo de 2026.
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-rose-300 bg-rose-50 space-y-3">
                <p className="text-xs sm:text-sm font-semibold text-rose-950">
                  {confirmResetMode === 'sync'
                    ? 'Confirmar restauração da lista oficial de alunos 2026 mantendo suas atividades e notas?'
                    : 'ATENÇÃO: Isso apagará TODAS as atividades e notas de todas as 12 turmas. Recomendamos exportar um backup JSON antes. Deseja continuar?'}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmResetMode(null)}
                    className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onRestoreRealClasses(confirmResetMode);
                      setConfirmResetMode(null);
                      onClose();
                    }}
                    className="px-3.5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
                  >
                    Confirmar restauração
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
