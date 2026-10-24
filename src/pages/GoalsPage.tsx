import { useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useSessionUser } from '../hooks/useSessionUser';
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
import { GoalAmountModal } from '../components/GoalAmountModal/GoalAmountModal';
import { Modal } from '../components/Modal/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog';
import { formatCurrency } from '../utils/format';
import { formatMonthYear } from '../utils/goals';
import { useGoals } from '../hooks/useGoals';
import { useFinancialPrivacy } from '../hooks/useFinancialPrivacy';
import { getGoalIcon, getGoalProgress } from '../utils/goals';
import type { GoalFilter, GoalFormValues, GoalViewModel } from '../types/goals.types';

export function GoalsPage() {
  const user = useSessionUser();
  const { valuesVisible } = useFinancialPrivacy();
  const fullName = user ? `${user.nome} ${user.sobrenome ?? ''}`.trim() : 'Usuário';

  const { goals, loading, error, saving, formError, clearFormError, createGoal, updateGoal, contributeGoal, adjustGoal, changeGoalStatus, deleteGoal, reload } = useGoals();

  const [searchParams, setSearchParams] = useSearchParams();
  const [contributingGoal, setContributingGoal] = useState<GoalViewModel | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<GoalFilter>('todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalViewModel | null>(null);
  const [adjustingGoal, setAdjustingGoal] = useState<GoalViewModel | null>(null);
  const [viewingGoal, setViewingGoal] = useState<GoalViewModel | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<GoalViewModel | null>(null);

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
    setDeletingGoal(goal);
  }
  function openAdjustment(goal: GoalViewModel) { clearFormError(); setAdjustingGoal(goal); }
  function handleAdjustment(value: number, mode: 'total' | 'withdraw') {
    if (!adjustingGoal || saving) return;
    adjustGoal(adjustingGoal.id, value, mode).then(() => { setAdjustingGoal(null); setSuccess('Valor guardado ajustado. O progresso foi recalculado.'); }).catch(() => undefined);
  }
  function toggleStatus(goal: GoalViewModel) {
    if (saving) return;
    clearFormError();
    changeGoalStatus(goal.id, goal.status === 'cancelada' ? 'em_andamento' : 'cancelada').then(() => setSuccess(goal.status === 'cancelada' ? 'Meta reativada.' : 'Meta cancelada. Seus valores foram preservados.')).catch(() => undefined);
  }

  return (
    <DashboardLayout userName={fullName}>
      <GoalsHeader filter={filter} onFilterChange={setFilter} onNewGoal={openCreateModal} />
      <p className="mt-3 text-sm text-muted">Crie uma meta e use “Registrar valor guardado” para acompanhar o dinheiro que você já reservou.</p>
      {success && <p role="status" className="mt-4 text-sm text-positive">{success}</p>}
      {formError && !modalOpen && !adjustingGoal && !contributingGoal && <p role="alert" className="mt-4 text-sm text-danger">{formError}</p>}
      {error && <div role="alert" className="mt-4 text-sm text-danger"><p>{error}</p><button onClick={reload} className="min-h-11 font-semibold underline">Tentar novamente</button></div>}

      <div className="mt-6">
        <GoalSummaryCards
          metasAtivas={metasAtivas}
          valorObjetivo={valorObjetivo}
          valorEconomizado={valorEconomizado}
          progressoGeralPercentual={progressoGeralPercentual}
          valuesVisible={valuesVisible}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-semibold text-foreground">Minhas Metas</h2>
            <span className="text-xs text-subtle">
              {goals.length} {goals.length === 1 ? 'meta encontrada' : 'metas encontradas'}
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-muted">Carregando metas...</p>
          ) : filteredGoals.length === 0 ? (
            error ? <p className="text-sm text-muted">Não foi possível carregar suas metas. Recarregue a página para tentar novamente.</p> : goals.length > 0 ? <p className="text-sm text-muted">Nenhuma meta neste filtro.</p> : <EmptyGoals onNewGoal={openCreateModal} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredGoals.map((goal) => (
                <GoalListCard key={goal.id} goal={goal} onEdit={openEditModal} onDelete={handleDelete} onContribute={openContribution} onAdjust={openAdjustment} onToggleStatus={toggleStatus} disabled={saving} valuesVisible={valuesVisible} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <GoalProgressPanel
            economizado={valorEconomizado}
            objetivo={valorObjetivo}
            percentual={progressoGeralPercentual}
            valuesVisible={valuesVisible}
          />
          <AchievementsCard items={achievements} valuesVisible={valuesVisible} />
          <TipsCard />
        </div>
      </div>

      <div className="mt-6">
        <GoalHistoryTable goals={goals} disabled={saving} onView={setViewingGoal} onEdit={openEditModal} onDelete={handleDelete} valuesVisible={valuesVisible} />
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
      {adjustingGoal && <GoalAmountModal key={adjustingGoal.id} goal={adjustingGoal} saving={saving} error={formError} onClose={() => { if (!saving) setAdjustingGoal(null); }} onSubmit={handleAdjustment} />}
      <Modal open={Boolean(viewingGoal)} title="Detalhes da meta" saving={false} onClose={() => setViewingGoal(null)}>
        {viewingGoal && <div className="space-y-3 text-sm text-muted"><h3 className="break-words font-semibold text-foreground">{viewingGoal.titulo}</h3>{viewingGoal.descricao && <p className="break-words">{viewingGoal.descricao}</p>}<p>Guardado: {valuesVisible ? formatCurrency(viewingGoal.valorAtual) : 'R$ ••••••'}</p><p>Objetivo: {valuesVisible ? formatCurrency(viewingGoal.valorObjetivo) : 'R$ ••••••'}</p><p>Progresso: {valuesVisible ? `${getGoalProgress(viewingGoal)}%` : 'Oculto'}</p><p>Prazo: {viewingGoal.dataFim ? formatMonthYear(viewingGoal.dataFim) : 'Sem prazo definido'}</p></div>}
      </Modal>
      <ConfirmDialog open={Boolean(deletingGoal)} title="Excluir meta" description={'Excluir “' + (deletingGoal?.titulo ?? '') + '” e seu acompanhamento? Esta ação não movimenta dinheiro e não pode ser desfeita.'} saving={saving} error={error} onClose={() => { if (!saving) setDeletingGoal(null); }} onConfirm={() => { if (deletingGoal && !saving) deleteGoal(deletingGoal.id).then(() => setDeletingGoal(null)).catch(() => undefined); }} />
    </DashboardLayout>
  );
}
