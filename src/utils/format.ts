export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

// Recebe "AAAA-MM" e devolve o nome do mês.
export function formatMonth(value: string): string {
  const month = Number(value.slice(5, 7));
  return MONTH_NAMES[month - 1] ?? value;
}

export function parseMoney(raw: string): number {
  const value = raw.trim().replace(/^R\$\s*/, '');
  let normalized: string;
  if (/^(?:\d+|\d{1,3}(?:\.\d{3})+),\d{1,2}$/.test(value)) {
    normalized = value.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(?:\.\d{3})+$/.test(value)) {
    normalized = value.replace(/\./g, '');
  } else if (/^\d+(?:\.\d{1,2})?$/.test(value)) {
    normalized = value;
  } else {
    return NaN;
  }
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount <= 99999999.99 ? amount : NaN;
}

export function formatMoneyInput(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
