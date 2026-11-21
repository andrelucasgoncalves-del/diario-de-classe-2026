import React from 'react';
import {
  STATUS_CONFIG,
  calcularEstatisticasTurma,
  calcularResumoAluno,
  formatDateBR,
  formatScore,
  getEffectiveScore,
  registroKey
} from '../utils/storage';

export default function PrintReport({
  nomeTurma,
  turmaData,
  atividadesVisiveis,
  bimestreLabel
}) {
  const { alunos, registros } = turmaData;
  const stats = calcularEstatisticasTurma(alunos, atividadesVisiveis, registros);
  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="print-only text-slate-900 text-[11px] leading-tight">
      {/* Institutional Header */}
      <div className="border-b-2 border-slate-900 pb-2 mb-3 flex items-end justify-between">
        <div>
          <h1 className="text-base font-bold uppercase tracking-wide">
            EREFEM Pedro Pires Ferreira — Diário de Classe 2026
          </h1>
          <p className="text-xs text-slate-700 mt-0.5">
            Turma: <strong>{nomeTurma}</strong> &nbsp;|&nbsp; Período:{' '}
            <strong>{bimestreLabel}</strong> &nbsp;|&nbsp; Total de Alunos:{' '}
            <strong>{alunos.length}</strong> &nbsp;|&nbsp; Média Geral:{' '}
            <strong>
              {stats.mediaGeral10 !== null ? formatScore(stats.mediaGeral10) : '—'}
            </strong>
          </p>
        </div>
        <div className="text-right text-xs text-slate-600">
          Emitido em {dataHoje}
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-slate-400">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-400 px-1.5 py-1 text-center w-7">Nº</th>
            <th className="border border-slate-400 px-2 py-1 text-left w-20">Matrícula</th>
            <th className="border border-slate-400 px-2 py-1 text-left min-w-[150px]">
              Estudante
            </th>
            {atividadesVisiveis.map((atv) => (
              <th
                key={atv.id}
                className="border border-slate-400 px-1.5 py-1 text-center"
              >
                <div className="font-bold">{atv.titulo}</div>
                <div className="text-[9px] font-normal text-slate-600">
                  {formatDateBR(atv.data)} • Max {formatScore(atv.valorMax)}
                </div>
              </th>
            ))}
            <th className="border border-slate-400 px-2 py-1 text-center w-20">
              Soma
            </th>
            <th className="border border-slate-400 px-2 py-1 text-center w-16">
              Média
            </th>
          </tr>
        </thead>
        <tbody>
          {alunos.map((aluno, idx) => {
            const resumo = calcularResumoAluno(aluno, atividadesVisiveis, registros);
            return (
              <tr key={aluno.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : ''}>
                <td className="border border-slate-300 px-1.5 py-1 text-center font-mono">
                  {String(idx + 1).padStart(2, '0')}
                </td>
                <td className="border border-slate-300 px-2 py-1 font-mono text-[10px]">
                  {aluno.matricula || '—'}
                </td>
                <td className="border border-slate-300 px-2 py-1 font-semibold">
                  {aluno.nome}
                </td>
                {atividadesVisiveis.map((atv) => {
                  const reg = registros[registroKey(aluno.id, atv.id)];
                  const score = getEffectiveScore(reg, atv.valorMax);
                  const statusShort = reg?.status
                    ? STATUS_CONFIG[reg.status]?.shortLabel
                    : '';
                  return (
                    <td
                      key={atv.id}
                      className="border border-slate-300 px-1.5 py-1 text-center"
                    >
                      {score !== null
                        ? formatScore(score)
                        : statusShort || '—'}
                    </td>
                  );
                })}
                <td className="border border-slate-300 px-2 py-1 text-center font-semibold">
                  {atividadesVisiveis.length > 0
                    ? `${formatScore(resumo.totalObtido)}/${formatScore(resumo.totalPossivel)}`
                    : '—'}
                </td>
                <td className="border border-slate-300 px-2 py-1 text-center font-bold">
                  {resumo.media10 !== null ? formatScore(resumo.media10) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Signature Footer */}
      <div className="mt-8 flex items-center justify-between text-xs text-slate-600">
        <div>Legenda: Just. = Justificado (não penaliza média)</div>
        <div className="text-center w-64">
          <div className="border-t border-slate-600 pt-1">
            Assinatura do(a) Professor(a)
          </div>
        </div>
      </div>
    </div>
  );
}
