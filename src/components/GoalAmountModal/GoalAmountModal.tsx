import { useState, type FormEvent } from 'react';
import { Modal } from '../Modal/Modal';
import { MoneyInput } from '../MoneyInput/MoneyInput';
import { Select } from '../Select/Select';
import { Button } from '../Button/Button';
import { formatCurrency, formatMoneyInput, parseMoney } from '../../utils/format';
import type { GoalViewModel } from '../../types/goals.types';

export function GoalAmountModal({ goal, saving, error, onClose, onSubmit }: {
  goal: GoalViewModel; saving: boolean; error: string | null; onClose: () => void;
  onSubmit: (value: number, mode: 'total' | 'withdraw') => void;
}) {
  const [mode, setMode] = useState<'total' | 'withdraw'>('total');
  const [raw, setRaw] = useState(formatMoneyInput(goal.valorAtual));
  const value = parseMoney(raw);
  const valid = Number.isFinite(value) && (mode === 'total' ? value >= 0 : value > 0 && value <= goal.valorAtual);
  const result = mode === 'total' ? value : (Math.round(goal.valorAtual * 100) - Math.round(value * 100)) / 100;
  function submit(event: FormEvent) { event.preventDefault(); if (!saving && valid) onSubmit(value, mode); }
  return <Modal open title="Ajustar valor guardado" saving={saving} onClose={onClose}>
    <p className="break-words text-sm font-semibold text-foreground">{goal.titulo}</p>
    <p className="mt-2 text-sm text-muted">Total atual: {formatCurrency(goal.valorAtual)}. O ajuste altera o acompanhamento da meta e não movimenta sua conta.</p>
    <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
      <Select label="Operação" value={mode} disabled={saving} onChange={(e) => { const next = e.target.value as typeof mode; setMode(next); setRaw(next === 'total' ? formatMoneyInput(goal.valorAtual) : ''); }}>
        <option value="total">Corrigir o total guardado</option><option value="withdraw">Registrar uma retirada</option>
      </Select>
      <MoneyInput label={mode === 'total' ? 'Total correto guardado' : 'Valor da retirada'} required value={raw} disabled={saving} onValueChange={setRaw} />
      {valid ? <p role="status" className="text-sm text-muted">Total após o ajuste: <strong className="text-foreground">{formatCurrency(result)}</strong></p> : raw && <p role="alert" className="text-xs text-danger">{mode === 'withdraw' ? 'Informe uma retirada positiva que não exceda o valor guardado.' : 'Informe um total válido, a partir de R$ 0,00.'}</p>}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-2"><Button variant="outline" disabled={saving} onClick={onClose}>Cancelar</Button><Button type="submit" disabled={saving || !valid}>{saving ? 'Salvando...' : 'Salvar ajuste'}</Button></div>
    </form>
  </Modal>;
}
