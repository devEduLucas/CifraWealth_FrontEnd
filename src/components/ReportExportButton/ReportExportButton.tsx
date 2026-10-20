import { Download, FileSpreadsheet, LoaderCircle } from 'lucide-react';

interface ReportExportButtonProps {
  onExport?: () => void;
  onExportCsv?: () => void;
  exporting?: boolean;
}

export function ReportExportButton({ onExport, onExportCsv, exporting = false }: ReportExportButtonProps) {
  const enabled = Boolean(onExport) && !exporting;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onExport}
        disabled={!enabled}
        aria-busy={exporting}
        title={exporting ? 'Gerando seu relatório em PDF' : enabled ? 'Baixar relatório completo em PDF para o período aplicado' : 'Aguarde o carregamento do relatório'}
        className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent"
      >
        {exporting ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
        {exporting ? 'Gerando PDF...' : 'Baixar PDF'}
      </button>
      <button
        type="button"
        onClick={onExportCsv}
        disabled={!onExportCsv || exporting}
        aria-label="Baixar planilha CSV"
        title="Baixar CSV para abrir em uma planilha"
        className="flex items-center gap-2 rounded-xl border border-line-strong px-3 py-2.5 text-sm font-semibold text-secondary transition-colors hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FileSpreadsheet size={16} aria-hidden="true" />CSV
      </button>
    </div>
  );
}
