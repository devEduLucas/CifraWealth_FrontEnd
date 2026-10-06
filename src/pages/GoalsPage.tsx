import { useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { session } from '../lib/session';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { GoalsHeader } from '../components/GoalsHeader/GoalsHeader';
import { GoalSummaryCards } from '../components/GoalSummaryCards/GoalSummaryCards';
import { GoalListCard } from '../components/GoalListCard/GoalListCard';
import { EmptyGoals } from '../components/EmptyGoals/EmptyGoals';
import { GoalProgressPanel } from '../components/GoalProgressPanel/GoalProgressPanel';
import { AchievementsCard } from '../components/AchievementsCard/AchievementsCard';
import { TipsCard } from '../components/TipsCard/TipsCard';
import { GoalHistoryTable } from '../components/GoalHistoryTable/GoalHistoryTable';
import { ContributeGoalModal } from '../components/ContributeGoalModal/ContributeGoalModal';
import { NewGoalModal } from '../components/NewGoalModal/NewGoalModal';
import { useGoals } from '../hooks/useGoals';
import { getGoalIcon, getGoalProgress } from '../utils/goals';
import type { GoalFilter, GoalFormValues, GoalViewModel } from '../types/goals.types';

export function GoalsPage() {
  const user = session.getUser();
  const fullName = user ? `${user.nome} ${user.sobrenome ?? ''}`.trim() : 'Usuário';

  const { goals, loading, error, saving, formError, clearFormError, createGoal, updateGoal, contributeGoal, deleteGoal } = useGoals();

  const [searchParams, setSearchParams] = useSearchParams();
  const [contributingGoal, setContributingGoal] = useState<GoalViewModel | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<GoalFilter>('todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalViewModel | null>(null);

  useEffect(() => {
    if (loading) return;
    if (searchParams.get('new') === '1') { clearFormError(); setEditingGoal(null); setModalOpen(true); setSearchParams({}, { replace: true }); }
    const id = Number(searchParams.get('contribute'));
    if (id) { const goal = goals.find((item) => item.id === id && item.status !== 'cancelada' && item.status !== 'concluida'); if (goal) { clearFormError(); setContributingGoal(goal); } setSearchParams({}, { replace: true }); }
  }, [loading, searchParams, setSearchParams, goals, clearFormError]);
  const filteredGoals = useMemo(() => {
    if (filter === 'em_andamento') {
      return goals.filter((goal) => goal.status === 'em_andamento' || goal.status === 'atrasada');
    }
    if (filter === 'concluidas') {
      return goals.filter((goal) => goal.status === 'concluida');
    }
    return goals;
  }, [goals, filter]);

  const metasAtivas = goals.filter((goal) => goal.status === 'em_andamento' || goal.status === 'atrasada').length;
  const relevantGoals = goals.filter((goal) => goal.status !== 'cancelada');
  const valorObjetivo = relevantGoals.reduce((sum, goal) => sum + goal.valorObjetivo, 0);
  const valorEconomizado = relevantGoals.reduce((sum, goal) => sum + goal.valorAtual, 0);
  const progressoGeralPercentual = valorObjetivo > 0 ? Math.min(Math.floor((valorEconomizado / valorObjetivo) * 100), 100) : 0;

  const achievements = useMemo(() => {
    return goals
      .filter((goal) => goal.status === 'em_andamento' || goal.status === 'atrasada')
      .sort((a, b) => getGoalProgress(b) - getGoalProgress(a))
      .slice(0, 3)
      .map((goal) => ({
        id: goal.id,
        titulo: goal.titulo,
        icon: getGoalIcon(goal.titulo),
        faltam: Math.max(goal.valorObjetivo - goal.valorAtual, 0),
        dataFim: goal.dataFim,
      }));
  }, [goals]);

  function openCreateModal() {
    clearFormError();
    setEditingGoal(null);
    setModalOpen(true);
  }

  function openEditModal(goal: GoalViewModel) {
    clearFormError();
    setEditingGoal(goal);
    setModalOpen(true);
  }

  function handleModalSubmit(values: GoalFormValues) {
    const action = editingGoal ? updateGoal(editingGoal.id, values) : createGoal(values);
    action.then(() => setModalOpen(false)).catch(() => undefined);
  }

  function openContribution(goal: GoalViewModel) {
    clearFormError(); setSuccess(null); setContributingGoal(goal);
  }
  function handleContribution(value: number) {
    if (!contributingGoal || saving) return;
    contributeGoal(contributingGoal.id, value).then(() => {
      setContributingGoal(null); setSuccess('Valor guardado registrado. O progresso da meta foi atualizado.');
    }).catch(() => undefined);
  }
  function handleDelete(goal: GoalViewModel) {
    if (window.confirm(`Excluir a meta "${goal.titulo}"?`)) {
      deleteGoal(goal.id).catch(() => undefined);
    }
  }

  return (
    <DashboardLayout userName={fullName}>
      <GoalsHeader filter={filter} onFilterChange={setFilter} onNewGoal={openCreateModal} />
      <p className="mt-3 text-sm text-slate-400">Crie uma meta e use “Registrar valor guardado” para acompanhar o dinheiro que você já reservou.</p>
      {success && <p role="status" className="mt-4 text-sm text-teal-400">{success}</p>}

      <div className="mt-6">
        <GoalSummaryCards
          metasAtivas={metasAtivas}
          valorObjetivo={valorObjetivo}
          valorEconomizado={valorEconomizado}
          progressoGeralPercentual={progressoGeralPercentual}
        />
      </div>

      {error && (
        <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-white">Minhas Metas</h2>
            <span className="text-xs text-slate-500">
              {goals.length} {goals.length === 1 ? 'meta encontrada' : 'metas encontradas'}
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Carregando metas...</p>
          ) : filteredGoals.length === 0 ? (
            error ? <p className="text-sm text-slate-400">Não foi possível carregar suas metas. Recarregue a página para tentar novamente.</p> : goals.length > 0 ? <p className="text-sm text-slate-400">Nenhuma meta neste filtro.</p> : <EmptyGoals onNewGoal={openCreateModal} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredGoals.map((goal) => (
                <GoalListCard key={goal.id} goal={goal} onEdit={openEditModal} onDelete={handleDelete} onContribute={openContribution} disabled={saving} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <GoalProgressPanel
            economizado={valorEconomizado}
            objetivo={valorObjetivo}
            percentual={progressoGeralPercentual}
          />
          <AchievementsCard items={achievements} />
          <TipsCard />
        </div>
      </div>

      <div className="mt-6">
        <GoalHistoryTable goals={goals} onView={openEditModal} onEdit={openEditModal} onDelete={handleDelete} />
      </div>

      <ContributeGoalModal key={contributingGoal?.id ?? "closed"} open={Boolean(contributingGoal)} goal={contributingGoal} saving={saving} error={formError} onClose={() => { if (!saving) setContributingGoal(null); }} onSubmit={handleContribution} />
      <NewGoalModal
        open={modalOpen}
        goal={editingGoal}
        saving={saving}
        error={formError}
        onClose={() => { if (!saving) setModalOpen(false); }}
        onSubmit={handleModalSubmit}
      />
    </DashboardLayout>
  );
}
