import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { toGoalViewModel } from '../utils/goals';
import type { GoalFormValues, GoalViewModel } from '../types/goals.types';

function toGoalInput(values: GoalFormValues) {
  return { titulo: values.titulo.trim(), descricao: values.descricao.trim() || null, valor_objetivo: Number(values.valorObjetivo), data_fim: values.dataFim || null };
}
export function useGoals() {
  const [goals, setGoals] = useState<GoalViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    api.listGoals().then((items) => { if (active) setGoals(items.map(toGoalViewModel)); })
      .catch((err: unknown) => { if (active) setError(err instanceof ApiError ? err.message : 'Erro ao carregar metas.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
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
  async function deleteGoal(id: number) {
    setSaving(true); setError(null);
    try { await api.deleteGoal(id); setGoals((items) => items.filter((item) => item.id !== id)); }
    catch (err) { setError(err instanceof ApiError ? err.message : 'Erro ao excluir meta.'); throw err; }
    finally { setSaving(false); }
  }
  return { goals, loading, error, saving, formError, clearFormError, createGoal, updateGoal, contributeGoal, deleteGoal };
}
