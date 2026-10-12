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
  const value = raw.trim();
  const normalized = value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value;
  return Number(normalized);
}