import { ORDEM_TURMAS, TURMAS_INICIAIS } from '../data/turmas2026';

export const STORAGE_KEY = 'diario_classe_lucas_2026_v3';

export const STATUS_CONFIG = {
  fez: {
    key: 'fez',
    label: 'Fez',
    shortLabel: 'Fez',
    percentLabel: '100%',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200',
    activeButtonClass: 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
    inactiveButtonClass: 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
  },
  parcial: {
    key: 'parcial',
    label: 'Parcial',
    shortLabel: '50%',
    percentLabel: '50%',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200',
    activeButtonClass: 'bg-amber-500 text-white border-amber-500 shadow-sm',
    inactiveButtonClass: 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'
  },
  nao_fez: {
    key: 'nao_fez',
    label: 'Não fez',
    shortLabel: 'Não',
    percentLabel: '0%',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200',
    activeButtonClass: 'bg-rose-600 text-white border-rose-600 shadow-sm',
    inactiveButtonClass: 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
  },
  justificado: {
    key: 'justificado',
    label: 'Justificado',
    shortLabel: 'Just.',
    percentLabel: 'Just.',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300 hover:bg-sky-200',
    activeButtonClass: 'bg-sky-600 text-white border-sky-600 shadow-sm',
    inactiveButtonClass: 'bg-white text-sky-700 border-sky-200 hover:bg-sky-50'
  }
};

export const STATUS_CYCLE = [null, 'fez', 'parcial', 'nao_fez', 'justificado'];

export function roundScore(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

export function getNextStatus(currentStatus) {
  const idx = STATUS_CYCLE.indexOf(currentStatus || null);
  if (idx === -1 || idx === STATUS_CYCLE.length - 1) return STATUS_CYCLE[0];
  return STATUS_CYCLE[idx + 1];
}

export function getDefaultScoreForStatus(status, valorMax) {
  const max = Number(valorMax) || 0;
  if (status === 'fez') return roundScore(max);
  if (status === 'parcial') return roundScore(max * 0.5);
  if (status === 'nao_fez') return 0;
  return null; // justificado or null
}

export function registroKey(alunoId, atividadeId) {
  return `${alunoId}__${atividadeId}`;
}

export function createInitialData() {
  const turmas = {};
  for (const nomeTurma of ORDEM_TURMAS) {
    const lista = TURMAS_INICIAIS[nomeTurma] || [];
    turmas[nomeTurma] = {
      alunos: lista.map((aluno) => ({
        id: aluno.matricula,
        matricula: aluno.matricula,
        nome: aluno.nome
      })),
      atividades: [],
      registros: {}
    };
  }
  return {
    version: 3,
    updatedAt: new Date().toISOString(),
    turmas
  };
}

export function normalizeLoadedData(raw) {
  const base = createInitialData();
  if (!raw || typeof raw !== 'object' || !raw.turmas) return base;

  const turmas = {};
  for (const nomeTurma of ORDEM_TURMAS) {
    const saved = raw.turmas[nomeTurma];
    if (saved && Array.isArray(saved.alunos)) {
      turmas[nomeTurma] = {
        alunos: saved.alunos.map((a, idx) => ({
          id: String(a.id || a.matricula || `alu_${Date.now()}_${idx}`),
          matricula: String(a.matricula || ''),
          nome: String(a.nome || '').trim()
        })),
        atividades: Array.isArray(saved.atividades)
          ? saved.atividades.map((atv) => ({
              id: String(atv.id),
              titulo: String(atv.titulo || 'Atividade'),
              data: String(atv.data || getTodayISO()),
              valorMax: Number(atv.valorMax) || 1,
              bimestre: Number(atv.bimestre) || 1
            }))
          : [],
        registros: saved.registros && typeof saved.registros === 'object' ? saved.registros : {}
      };
    } else {
      turmas[nomeTurma] = base.turmas[nomeTurma];
    }
  }

  return {
    version: 3,
    updatedAt: raw.updatedAt || new Date().toISOString(),
    turmas
  };
}

export function loadAppData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialData();
    const parsed = JSON.parse(raw);
    return normalizeLoadedData(parsed);
  } catch {
    return createInitialData();
  }
}

export function saveAppData(data) {
  try {
    const payload = {
      ...data,
      version: 3,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function getTodayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateBR(isoDate) {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}`;
}

export function formatDateFullBR(isoDate) {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function formatScore(val) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  const num = roundScore(Number(val));
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: Number.isInteger(num) ? 1 : 1,
    maximumFractionDigits: 2
  });
}

export function getEffectiveScore(reg, valorMax) {
  if (!reg) return null;
  if (reg.nota !== null && reg.nota !== undefined && reg.nota !== '') {
    const parsed = Number(reg.nota);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (reg.status === 'fez') return roundScore(valorMax);
  if (reg.status === 'parcial') return roundScore((Number(valorMax) || 0) * 0.5);
  if (reg.status === 'nao_fez') return 0;
  return null;
}

export function calcularResumoAluno(aluno, atividades, registros) {
  let totalObtido = 0;
  let totalPossivel = 0;
  let feitas = 0;
  let parciais = 0;
  let naoFeitas = 0;
  let justificadas = 0;
  let pendentes = 0;

  for (const atv of atividades) {
    const reg = registros[registroKey(aluno.id, atv.id)];
    const maxVal = Number(atv.valorMax) || 0;

    if (!reg || (!reg.status && (reg.nota === null || reg.nota === undefined || reg.nota === ''))) {
      pendentes++;
      totalPossivel += maxVal;
      continue;
    }

    if (reg.status === 'fez') feitas++;
    else if (reg.status === 'parcial') parciais++;
    else if (reg.status === 'nao_fez') naoFeitas++;
    else if (reg.status === 'justificado') justificadas++;

    const score = getEffectiveScore(reg, maxVal);
    if (reg.status === 'justificado' && score === null) {
      // Justified without explicit grade does not penalize totalPossivel
      continue;
    }

    totalPossivel += maxVal;
    if (score !== null) {
      totalObtido += score;
    }
  }

  totalObtido = roundScore(totalObtido);
  totalPossivel = roundScore(totalPossivel);

  const percentual = totalPossivel > 0 ? Math.round((totalObtido / totalPossivel) * 100) : null;
  const media10 = totalPossivel > 0 ? roundScore((totalObtido / totalPossivel) * 10) : null;

  return {
    totalObtido,
    totalPossivel,
    percentual,
    media10,
    feitas,
    parciais,
    naoFeitas,
    justificadas,
    pendentes
  };
}

export function calcularEstatisticasTurma(alunos, atividades, registros) {
  if (!alunos.length || !atividades.length) {
    return {
      mediaGeral10: null,
      percentualGeral: null
    };
  }

  let somaMedias = 0;
  let countMedias = 0;
  let somaPct = 0;

  for (const aluno of alunos) {
    const res = calcularResumoAluno(aluno, atividades, registros);
    if (res.media10 !== null) {
      somaMedias += res.media10;
      somaPct += res.percentual;
      countMedias++;
    }
  }

  if (countMedias === 0) {
    return { mediaGeral10: null, percentualGeral: null };
  }

  return {
    mediaGeral10: roundScore(somaMedias / countMedias),
    percentualGeral: Math.round(somaPct / countMedias)
  };
}

export function getTurmasMesmoAno(turmaAtual) {
  const prefixo = turmaAtual.split(' ')[0]; // "6º", "9º", "1º", "2º", "3º"
  const isMedio = turmaAtual.includes('Médio');
  return ORDEM_TURMAS.filter((t) => {
    if (t === turmaAtual) return false;
    return t.startsWith(prefixo) && t.includes('Médio') === isMedio;
  });
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
