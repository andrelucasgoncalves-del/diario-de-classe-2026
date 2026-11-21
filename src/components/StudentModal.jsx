import React, { useEffect, useState } from 'react';
import { X, UserPlus, Users, Trash2, Edit3, Check } from 'lucide-react';

export default function StudentModal({
  isOpen,
  onClose,
  turmaAtiva,
  alunos,
  alunoEditandoInicial,
  onAddAluno,
  onAddLote,
  onUpdateAluno,
  onRemoveAluno
}) {
  const [aba, setAba] = useState('individual'); // 'individual' | 'lote' | 'lista'
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [loteTexto, setLoteTexto] = useState('');
  const [editId, setEditId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editMatricula, setEditMatricula] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (alunoEditandoInicial) {
      setAba('lista');
      setEditId(alunoEditandoInicial.id);
      setEditNome(alunoEditandoInicial.nome);
      setEditMatricula(alunoEditandoInicial.matricula || '');
    } else {
      setAba('individual');
      setEditId(null);
      setNome('');
      setMatricula('');
      setLoteTexto('');
    }
  }, [isOpen, alunoEditandoInicial]);

  if (!isOpen) return null;

  const parseLote = (texto) => {
    return texto
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        // Accepts "3915716 - Nome do Aluno" or "3915716;Nome" or just "Nome do Aluno"
        const match = line.match(/^(\d{4,12})\s*[-;,\t]\s*(.+)$/);
        if (match) {
          return { matricula: match[1].trim(), nome: match[2].trim() };
        }
        return { matricula: '', nome: line };
      })
      .filter((item) => item.nome.length > 0);
  };

  const lotePreview = parseLote(loteTexto);

  const handleAddSingle = (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onAddAluno({ nome: nome.trim(), matricula: matricula.trim() });
    setNome('');
    setMatricula('');
  };

  const handleAddBatch = (e) => {
    e.preventDefault();
    if (lotePreview.length === 0) return;
    onAddLote(lotePreview);
    setLoteTexto('');
    setAba('lista');
  };

  const handleSaveEdit = (alunoId) => {
    if (!editNome.trim()) return;
    onUpdateAluno(alunoId, {
      nome: editNome.trim(),
      matricula: editMatricula.trim()
    });
    setEditId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Gerenciar Alunos • {turmaAtiva}
            </h2>
            <p className="text-xs text-slate-500">
              {alunos.length} alunos cadastrados nesta turma
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

        {/* Tabs */}
        <div className="px-5 pt-3 flex gap-1.5 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setAba('individual')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              aba === 'individual'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Individual
          </button>
          <button
            type="button"
            onClick={() => setAba('lote')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              aba === 'lote'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Adicionar em Lote
          </button>
          <button
            type="button"
            onClick={() => setAba('lista')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
              aba === 'lista'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar / Remover ({alunos.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {aba === 'individual' && (
            <form onSubmit={handleAddSingle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nome do Aluno *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Maria Clara Santos"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Matrícula (opcional)
                </label>
                <input
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Ex: 4012345"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 active:scale-95 text-white text-sm font-bold rounded-xl shadow-sm transition"
                >
                  Adicionar à turma {turmaAtiva}
                </button>
              </div>
            </form>
          )}

          {aba === 'lote' && (
            <form onSubmit={handleAddBatch} className="space-y-3">
              <p className="text-xs text-slate-600">
                Cole um aluno por linha. Você pode colar apenas o nome ou no formato{' '}
                <code className="bg-slate-100 px-1.5 py-0.5 rounded">matrícula - nome</code>.
              </p>
              <textarea
                rows={7}
                value={loteTexto}
                onChange={(e) => setLoteTexto(e.target.value)}
                placeholder={'Ana Beatriz\nJoão Pedro\n4012999 - Lucas Gabriel'}
                className="w-full p-3 text-sm bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-600 rounded-xl outline-none font-mono"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-600">
                  {lotePreview.length} aluno(s) detectado(s)
                </span>
                <button
                  type="submit"
                  disabled={lotePreview.length === 0}
                  className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition"
                >
                  Adicionar {lotePreview.length > 0 ? `(${lotePreview.length})` : ''}
                </button>
              </div>
            </form>
          )}

          {aba === 'lista' && (
            <div className="space-y-2">
              {alunos.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">
                  Nenhum aluno nesta turma.
                </p>
              ) : (
                alunos.map((aluno, idx) => {
                  const isEditing = editId === aluno.id;
                  return (
                    <div
                      key={aluno.id}
                      className={`p-2.5 rounded-xl border transition ${
                        isEditing
                          ? 'bg-blue-50/70 border-blue-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={editNome}
                              onChange={(e) => setEditNome(e.target.value)}
                              className="sm:col-span-2 px-3 py-1.5 text-sm bg-white border border-blue-400 rounded-lg outline-none"
                              placeholder="Nome"
                              autoFocus
                            />
                            <input
                              type="text"
                              value={editMatricula}
                              onChange={(e) => setEditMatricula(e.target.value)}
                              className="px-3 py-1.5 text-sm bg-white border border-blue-400 rounded-lg outline-none font-mono"
                              placeholder="Matrícula"
                            />
                          </div>
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditId(null)}
                              className="px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-white rounded-lg"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(aluno.id)}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-blue-900 text-white rounded-lg"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Salvar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-bold text-slate-400 w-5 text-right shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {aluno.nome}
                              </p>
                              {aluno.matricula && (
                                <p className="text-[11px] text-slate-500 font-mono">
                                  Mat. {aluno.matricula}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditId(aluno.id);
                                setEditNome(aluno.nome);
                                setEditMatricula(aluno.matricula || '');
                              }}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-white rounded-lg transition"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Remover "${aluno.nome}" da turma ${turmaAtiva}?`
                                  )
                                ) {
                                  onRemoveAluno(aluno.id);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition"
                              title="Remover aluno"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
