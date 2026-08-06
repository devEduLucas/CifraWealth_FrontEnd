import { Calendar, ChevronDown } from 'lucide-react';
import type { ReportPeriod } from '../../types/reports.types';

interface ReportPeriodFilterProps {
  value: ReportPeriod;
  onChange: (value: ReportPeriod) => void;
}

const OPTIONS: { value: ReportPeriod; label: string }[] = [
  { value: '3m', label: 'Últimos 3 meses' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '12m', label: 'Últimos 12 meses' },
  { value: 'custom', label: 'Personalizado' },
];

export function ReportPeriodFilter({ value, onChange }: ReportPeriodFilterProps) {
  return (
    <div className="relative flex items-center gap-2 rounded-xl border border-[#262F40] bg-[#161F32] py-2.5 pl-3.5 pr-8 text-sm font-medium text-slate-200">
      <Calendar size={16} className="shrink-0 text-slate-400" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ReportPeriod)}
        aria-label="Selecionar período do relatório"
        className="appearance-none bg-transparent text-sm font-medium text-slate-200 outline-none"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#161F32] text-slate-200">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 text-slate-500" />
    </div>
  );
}
