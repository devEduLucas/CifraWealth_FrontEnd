import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { toGoalViewModel } from '../utils/goals';
import type { GoalFormValues, GoalViewModel } from '../types/goals.types';

interface UseGoalsResult {
  goals: GoalViewModel[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  formError: string | null;
  createGoal: (values: GoalFormValues) => Promise<void>;
  updateGoal: (id: number, values: GoalFormValues) => Promise<void>;
  deleteGoal: (id: number) => Promise<void>;
}

function toGoalInput(values: GoalFormValues) {
  return {
    titulo: values.titulo.trim(),
    descricao: values.descricao.trim() || undefined,
    valor_objetivo: Number(values.valorObjetivo),
    data_fim: values.dataFim || undefined,
  };
}

export function useGoals(): UseGoalsResult {
  const [goals, setGoals] = useState<GoalViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadGoals = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .listGoals()
      .then((result) => setGoals(result.map(toGoalViewModel)))
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : 'Erro ao carregar metas.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(loadGoals, [loadGoals]);

  async function createGoal(values: GoalFormValues) {
    setSaving(true);
    setFormError(null);
    try {
      await api.createGoal(toGoalInput(values));
      loadGoals();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Erro ao criar meta.');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function updateGoal(id: number, values: GoalFormValues) {
    setSaving(true);
    setFormError(null);
    try {
      await api.updateGoal(id, toGoalInput(values));
      loadGoals();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Erro ao atualizar meta.');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function deleteGoal(id: number) {
    try {
      await api.deleteGoal(id);
      loadGoals();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao excluir meta.');
      throw err;
    }
  }

  return { goals, loading, error, saving, formError, createGoal, updateGoal, deleteGoal };
}
