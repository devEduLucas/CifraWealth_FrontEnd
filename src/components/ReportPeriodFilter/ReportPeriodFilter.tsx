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
    <div className="field-shell h-11">
      <Calendar size={16} className="pointer-events-none absolute left-3.5 text-slate-400" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ReportPeriod)}
        aria-label="Selecionar período do relatório"
        className="appearance-none pl-10 pr-9 text-sm font-medium text-slate-200"
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
