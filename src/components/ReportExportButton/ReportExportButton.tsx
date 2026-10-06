import { Download } from 'lucide-react';

interface ReportExportButtonProps {
  onExport?: () => void;
}

export function ReportExportButton({ onExport }: ReportExportButtonProps) {
  const enabled = Boolean(onExport);

  return (
    <button
      type="button"
      onClick={onExport}
      disabled={!enabled}
      title={enabled ? 'Baixar relatório detalhado em CSV' : 'Aguarde o carregamento do relatório'}
      className="flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-teal-500"
    >
      <Download size={16} />
      Exportar Relatório
    </button>
  );
}
