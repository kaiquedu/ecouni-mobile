import { WASTE_ORDER, wasteFromValue } from '../../theme';
import { addDays, formatDate, formatDayMonth, formatMonthYear, litros, parseDate, startOfDay, totalsByType } from '../../utils/format';

export const PERIODS = [
  { value: '7d', label: '7 dias' },
  { value: 'mes', label: 'Este mês' },
  { value: '30d', label: '30 dias' },
  { value: 'custom', label: 'Personalizado' },
];

export const defaultFilters = () => ({
  period: 'mes',
  from: addDays(startOfDay(new Date()), -29),
  to: startOfDay(new Date()),
  types: [...WASTE_ORDER],
  colaborador: null,
});

export const periodRange = (f) => {
  const today = startOfDay(new Date());
  switch (f.period) {
    case '7d':
      return { from: addDays(today, -6), to: today };
    case '30d':
      return { from: addDays(today, -29), to: today };
    case 'custom':
      return f.from <= f.to ? { from: startOfDay(f.from), to: startOfDay(f.to) } : { from: startOfDay(f.to), to: startOfDay(f.from) };
    default:
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today };
  }
};

export const periodLabel = (f) => {
  const { from, to } = periodRange(f);
  return `${formatDate(from)} a ${formatDate(to)}`;
};

export const applyFilters = (coletas, f) => {
  const { from, to } = periodRange(f);
  const end = addDays(to, 1);
  return coletas.filter((c) => {
    const d = parseDate(c.DataRegistro);
    if (d < from || d >= end) return false;
    if (!f.types.includes(wasteFromValue(c.TipoResiduo).key)) return false;
    if (f.colaborador && c.NomeColaborador !== f.colaborador) return false;
    return true;
  });
};

export const summarize = (list) => {
  const totals = totalsByType(list);
  const reciclado = totals.total ? (totals.reciclavel + totals.papel) / totals.total : 0;
  const pct = (k) => (totals.total ? Math.round((totals[k] / totals.total) * 100) : 0);
  return { totals, reciclado, pct, count: list.length };
};

export const buckets = (list, f, granularity) => {
  const { from, to } = periodRange(f);
  const out = [];
  if (granularity === 'dia') {
    const start = addDays(to, -9) > from ? addDays(to, -9) : from;
    for (let d = start; d <= to; d = addDays(d, 1)) out.push({ start: d, end: addDays(d, 1), label: String(d.getDate()) });
  } else if (granularity === 'semana') {
    for (let d = from; d <= to; d = addDays(d, 7)) {
      const end = addDays(d, 7) > addDays(to, 1) ? addDays(to, 1) : addDays(d, 7);
      out.push({ start: d, end, label: formatDayMonth(d) });
    }
  } else {
    let d = new Date(from.getFullYear(), from.getMonth(), 1);
    while (d <= to) {
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      out.push({ start: d < from ? from : d, end: next > addDays(to, 1) ? addDays(to, 1) : next, label: formatMonthYear(d) });
      d = next;
    }
  }
  const last = out.slice(granularity === 'mes' ? -12 : granularity === 'semana' ? -8 : -10);
  return last.map((b) => {
    const items = list.filter((c) => {
      const d = parseDate(c.DataRegistro);
      return d >= b.start && d < b.end;
    });
    const t = totalsByType(items);
    return { ...b, ...t };
  });
};

export const colaboradores = (coletas) =>
  [...new Set(coletas.map((c) => c.NomeColaborador).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const rowsFor = (list) =>
  list.map((c) => {
    const d = parseDate(c.DataRegistro);
    return { ...c, date: d, tipo: wasteFromValue(c.TipoResiduo), litros: litros(c) };
  });
