import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { toGoalViewModel } from '../utils/goals';
import { parseMoney } from '../utils/format';
import type { GoalFormValues, GoalViewModel } from '../types/goals.types';

function toGoalInput(values: GoalFormValues) {
  return { titulo: values.titulo.trim(), descricao: values.descricao.trim() || null, valor_objetivo: parseMoney(values.valorObjetivo), data_fim: values.dataFim || null };
}
export function useGoals() {
  const [goals, setGoals] = useState<GoalViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    api.listGoals().then((items) => { if (active) setGoals(items.map(toGoalViewModel)); })
      .catch((err: unknown) => { if (active) setError(err instanceof ApiError ? err.message : 'Erro ao carregar metas.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadKey]);
  const clearFormError = useCallback(() => setFormError(null), []);
  async function save(action: () => ReturnType<typeof api.createGoal>) {
    setSaving(true); setFormError(null);
    try {
      const item = toGoalViewModel(await action());
      setGoals((previous) => previous.some((goal) => goal.id === item.id) ? previous.map((goal) => goal.id === item.id ? item : goal) : [item, ...previous]);
      return item;
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Não foi possível salvar. Tente novamente.');
      throw err;
    } finally { setSaving(false); }
  }
  async function createGoal(values: GoalFormValues) { await save(() => api.createGoal(toGoalInput(values))); }
  async function updateGoal(id: number, values: GoalFormValues) { await save(() => api.updateGoal(id, toGoalInput(values))); }
  async function contributeGoal(id: number, value: number) { await save(() => api.contributeGoal(id, value)); }
  async function adjustGoal(id: number, value: number, mode: 'total' | 'withdraw') { await save(() => mode === 'withdraw' ? api.withdrawGoal(id, value) : api.updateGoal(id, { valor_atual: value })); }
  async function changeGoalStatus(id: number, status: 'cancelada' | 'em_andamento') { await save(() => api.updateGoal(id, { status })); }
  async function deleteGoal(id: number) {
    setSaving(true); setError(null);
    try { await api.deleteGoal(id); setGoals((items) => items.filter((item) => item.id !== id)); }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Erro ao excluir meta.'); throw err; }
    finally { setSaving(false); }
  }
  return { goals, loading, error, saving, formError, clearFormError, createGoal, updateGoal, contributeGoal, adjustGoal, changeGoalStatus, deleteGoal, reload: () => setReloadKey((key) => key + 1) };
}
