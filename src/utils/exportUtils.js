import {
  STATUS_CONFIG,
  calcularResumoAluno,
  formatDateFullBR,
  formatScore,
  getEffectiveScore,
  getTodayISO,
  registroKey
} from './storage';

function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeCsvCell(value) {
  const str = String(value ?? '');
  if (str.includes(';') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportBackupJSON(appData) {
  const today = getTodayISO();
  const payload = {
    app: 'Diário de Classe - EREFEM Pedro Pires Ferreira (2026)',
    exportedAt: new Date().toISOString(),
    ...appData
  };
  triggerDownload(
    JSON.stringify(payload, null, 2),
    `backup-diario-classe-2026-${today}.json`,
    'application/json;charset=utf-8'
  );
}

export function exportTurmaCSV(nomeTurma, turmaData, atividadesVisiveis, bimestreLabel) {
  const { alunos, registros } = turmaData;
  const headers = [
    'Nº',
    'Matrícula',
    'Aluno',
    ...atividadesVisiveis.map(
      (a) => `${a.titulo} (${a.bimestre}º Bim - ${formatDateFullBR(a.data)} - Max ${formatScore(a.valorMax)})`
    ),
    'Total Obtido',
    'Total Possível',
    'Média (0-10)',
    'Aproveitamento (%)'
  ];

  const rows = alunos.map((aluno, index) => {
    const resumo = calcularResumoAluno(aluno, atividadesVisiveis, registros);
    const activityCells = atividadesVisiveis.map((atv) => {
      const reg = registros[registroKey(aluno.id, atv.id)];
      if (!reg) return '';
      const score = getEffectiveScore(reg, atv.valorMax);
      const statusText = reg.status ? STATUS_CONFIG[reg.status]?.label || '' : '';
      const obsText = reg.obs ? ` [Obs: ${reg.obs}]` : '';
      if (score !== null && statusText) {
        return `${formatScore(score)} (${statusText})${obsText}`;
      }
      if (score !== null) {
        return `${formatScore(score)}${obsText}`;
      }
      return `${statusText}${obsText}`.trim();
    });

    return [
      index + 1,
      aluno.matricula || '',
      aluno.nome,
      ...activityCells,
      formatScore(resumo.totalObtido),
      formatScore(resumo.totalPossivel),
      resumo.media10 !== null ? formatScore(resumo.media10) : '',
      resumo.percentual !== null ? `${resumo.percentual}%` : ''
    ];
  });

  const csvLines = [
    [`EREFEM Pedro Pires Ferreira (2026) - Boletim da Turma ${nomeTurma} (${bimestreLabel})`],
    [],
    headers,
    ...rows
  ].map((line) => line.map(escapeCsvCell).join(';'));

  // BOM UTF-8 for proper Excel rendering of Portuguese accents
  const csvContent = '\uFEFF' + csvLines.join('\r\n');
  const safeTurma = nomeTurma
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase();
  triggerDownload(
    csvContent,
    `boletim-${safeTurma}-${getTodayISO()}.csv`,
    'text/csv;charset=utf-8'
  );
}
