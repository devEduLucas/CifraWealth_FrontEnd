import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { useSessionUser } from '../hooks/useSessionUser';
import { DashboardLayout } from '../components/DashboardLayout/DashboardLayout';
import { GoalsHeader } from '../components/GoalsHeader/GoalsHeader';
import { GoalCarousel } from '../components/GoalCarousel/GoalCarousel';
import { GoalDetail } from '../components/GoalDetail/GoalDetail';
import { EmptyGoals } from '../components/EmptyGoals/EmptyGoals';
import { GoalHistoryTable } from '../components/GoalHistoryTable/GoalHistoryTable';
import { ContributeGoalModal } from '../components/ContributeGoalModal/ContributeGoalModal';
import { NewGoalModal } from '../components/NewGoalModal/NewGoalModal';
import { GoalAmountModal } from '../components/GoalAmountModal/GoalAmountModal';
import { ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog';
import { formatCurrency } from '../utils/format';
import { useGoals } from '../hooks/useGoals';
import { useFinancialPrivacy } from '../hooks/useFinancialPrivacy';
import type { GoalFilter, GoalFormValues, GoalViewModel } from '../types/goals.types';

export function GoalsPage() {
  const user = useSessionUser();
  const { valuesVisible } = useFinancialPrivacy();
  const fullName = user ? `${user.nome} ${user.sobrenome ?? ''}`.trim() : 'Usuário';
  const { goals, loading, error, saving, formError, clearFormError, createGoal, updateGoal, contributeGoal, adjustGoal, changeGoalStatus, deleteGoal, reload } = useGoals();
  const navigate = useNavigate();
  const { goalId } = useParams();
  const [params, setParams] = useSearchParams();
  const detailMode = goalId !== undefined;
  const selectedGoal = /^\d+$/.test(goalId ?? '') ? goals.find((goal) => goal.id === Number(goalId)) : undefined;
  const [contributingId, setContributingId] = useState<number | null>(null);
  const [adjustingId, setAdjustingId] = useState<number | null>(null);
  const contributingGoal = goals.find((goal) => goal.id === contributingId) ?? null;
  const adjustingGoal = goals.find((goal) => goal.id === adjustingId) ?? null;
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<GoalFilter>('todas');
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalViewModel | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<GoalViewModel | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setContributingId(null); setAdjustingId(null); setModalOpen(false); setDeletingGoal(null); setSuccess(null); clearFormError();
  }, [goalId, clearFormError]);
  useEffect(() => {
    if (loading || error) return;
    const legacyId = params.get('detail') ?? params.get('contribute');
    if (!detailMode && legacyId && /^\d+$/.test(legacyId)) {
      navigate('/goals/' + legacyId + (params.has('contribute') ? '?guardar=1' : ''), { replace: true });
      return;
    }
    if (!detailMode && params.get('new') === '1') { clearFormError(); setEditingGoal(null); setModalOpen(true); setParams({}, { replace: true }); }
    if (detailMode && params.get('guardar') === '1' && selectedGoal) {
      clearFormError();
      if (selectedGoal.status !== 'cancelada' && selectedGoal.status !== 'concluida') setContributingId(selectedGoal.id);
      else setSuccess('Esta meta está concluída ou cancelada. Consulte os detalhes antes de alterar o acompanhamento.');
      const next = new URLSearchParams(params); next.delete('guardar'); setParams(next, { replace: true });
    }
  }, [loading, error, params, detailMode, selectedGoal, navigate, setParams, clearFormError]);
  useEffect(() => {
    if (selectedGoal) document.title = selectedGoal.titulo + ' | Metas | CifraWealth';
  }, [selectedGoal?.titulo, selectedGoal]);

  const filteredGoals = useMemo(() => filter === 'em_andamento' ? goals.filter((goal) => goal.status === 'em_andamento' || goal.status === 'atrasada') : filter === 'concluidas' ? goals.filter((goal) => goal.status === 'concluida') : goals, [goals, filter]);
  const activeCount = goals.filter((goal) => goal.status === 'em_andamento' || goal.status === 'atrasada').length;
  const relevantGoals = goals.filter((goal) => goal.status !== 'cancelada');
  const totalTarget = relevantGoals.reduce((sum, goal) => sum + goal.valorObjetivo, 0);
  const totalSaved = relevantGoals.reduce((sum, goal) => sum + goal.valorAtual, 0);
  function openCreate() { clearFormError(); setEditingGoal(null); setModalOpen(true); }
  function openEdit(goal: GoalViewModel) { clearFormError(); setEditingGoal(goal); setModalOpen(true); }
  function openContribution(goal: GoalViewModel) { clearFormError(); setSuccess(null); setContributingId(goal.id); }
  function openAdjustment(goal: GoalViewModel) { clearFormError(); setAdjustingId(goal.id); }
  async function handleSave(values: GoalFormValues) {
    try {
      if (editingGoal) { await updateGoal(editingGoal.id, values); setModalOpen(false); setSuccess('Meta atualizada. Seu planejamento foi salvo.'); }
      else { const created = await createGoal(values); setModalOpen(false); navigate('/goals/' + created.id); }
    } catch { /* The form retains input and exposes the API error. */ }
  }
  function handleContribution(value: number) {
    if (!contributingGoal || saving) return;
    contributeGoal(contributingGoal.id, value).then(() => { setContributingId(null); setSuccess('Valor guardado registrado. O progresso da meta foi atualizado.'); }).catch(() => undefined);
  }
  function handleAdjustment(value: number, mode: 'total' | 'withdraw') {
    if (!adjustingGoal || saving) return;
    adjustGoal(adjustingGoal.id, value, mode).then(() => { setAdjustingId(null); setSuccess('Valor guardado ajustado. O progresso foi recalculado.'); }).catch(() => undefined);
  }
  function toggleStatus(goal: GoalViewModel) {
    if (saving) return;
    clearFormError();
    changeGoalStatus(goal.id, goal.status === 'cancelada' ? 'em_andamento' : 'cancelada').then(() => setSuccess(goal.status === 'cancelada' ? 'Meta reativada.' : 'Meta cancelada. Seus valores foram preservados.')).catch(() => undefined);
  }
  async function confirmDelete() {
    if (!deletingGoal || saving) return;
    try { await deleteGoal(deletingGoal.id); setDeletingGoal(null); navigate('/goals', { replace: true }); }
    catch { /* The confirmation remains open with the API error. */ }
  }

  return <DashboardLayout userName={fullName}>
    {error && <div role="alert" className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger"><p>{error}</p><button type="button" onClick={reload} className="min-h-11 font-semibold underline">Tentar novamente</button></div>}
    {success && <p role="status" className="mb-4 rounded-xl bg-accent/10 p-3 text-sm text-foreground">{success}</p>}
    {formError && !modalOpen && !adjustingGoal && !contributingGoal && <p role="alert" className="mb-4 text-sm text-danger">{formError}</p>}
    {detailMode ? loading ? <p role="status" className="py-6 text-sm text-muted">Carregando sua meta...</p> : selectedGoal ? <GoalDetail goal={selectedGoal} valuesVisible={valuesVisible} saving={saving} onContribute={() => openContribution(selectedGoal)} onEdit={() => openEdit(selectedGoal)} onAdjust={() => openAdjustment(selectedGoal)} onStatus={() => toggleStatus(selectedGoal)} onDelete={() => setDeletingGoal(selectedGoal)} /> : <section className="rounded-2xl border border-line bg-surface p-6"><h1 className="text-xl font-bold text-foreground">{error ? 'Não foi possível abrir esta meta' : 'Meta não encontrada'}</h1><p className="mt-3 text-sm leading-6 text-muted">{error ? 'Tente carregar novamente para consultar seu planejamento.' : 'Ela pode ter sido excluída ou não pertencer à sua conta.'}</p><Link to="/goals" className="mt-4 inline-flex min-h-11 items-center font-semibold text-accent-ink">Voltar para minhas metas</Link></section> : <>
      <GoalsHeader filter={filter} onFilterChange={setFilter} onNewGoal={openCreate} />
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">Um espaço para cada objetivo. Escolha uma meta para consultar seu plano ou registrar o dinheiro que já reservou.</p>
      {!loading && !error && goals.length > 0 && <dl aria-label="Resumo das metas não canceladas" className="mt-5 grid grid-cols-2 gap-4 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-3">
        <div><dt className="text-xs text-muted">Em andamento</dt><dd className="mt-1 text-lg font-bold text-foreground">{activeCount}</dd></div>
        <div className="min-w-0"><dt className="text-xs text-muted">Total guardado</dt><dd className="mt-1 break-words text-lg font-bold text-foreground">{valuesVisible ? formatCurrency(totalSaved) : 'R$ ••••••'}</dd></div>
        <div className="col-span-2 min-w-0 sm:col-span-1"><dt className="text-xs text-muted">Objetivos não cancelados</dt><dd className="mt-1 break-words text-lg font-bold text-foreground">{valuesVisible ? formatCurrency(totalTarget) : 'R$ ••••••'}</dd></div>
      </dl>}
      <div className="mt-6 min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-foreground">Minhas metas</h2><p className="mt-1 text-xs text-muted">{filteredGoals.length} {filteredGoals.length === 1 ? 'meta encontrada' : 'metas encontradas'}</p></div><div role="group" aria-label="Visualização das metas" className="flex gap-1 rounded-xl border border-line bg-surface p-1">{([{ value: 'cards', label: 'Cartões', icon: LayoutGrid }, { value: 'table', label: 'Tabela', icon: List }] as const).map(({ value, label, icon: Icon }) => <button key={value} type="button" aria-pressed={view === value} onClick={() => setView(value)} className={'inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold ' + (view === value ? 'bg-accent/10 text-accent-ink' : 'text-muted hover:bg-elevated')}><Icon size={16} aria-hidden="true" />{label}</button>)}</div></div>
        {loading ? <p role="status" className="py-6 text-sm text-muted">Carregando metas...</p> : filteredGoals.length === 0 ? error ? <p className="text-sm text-muted">Seus objetivos estarão disponíveis após carregar novamente.</p> : goals.length ? <p className="py-8 text-sm text-muted">Nenhuma meta neste filtro.</p> : <EmptyGoals onNewGoal={openCreate} /> : view === 'cards' ? <GoalCarousel goals={filteredGoals} valuesVisible={valuesVisible} /> : <GoalHistoryTable goals={filteredGoals} valuesVisible={valuesVisible} disabled={saving} onView={(goal) => navigate('/goals/' + goal.id)} onContribute={(goal) => navigate('/goals/' + goal.id + '?guardar=1')} />}
      </div>
      <p className="mt-4 text-xs leading-6 text-muted">As metas acompanham suas reservas manuais. Elas não movimentam dinheiro nem descontam valores do saldo automaticamente.</p>
    </>}
    <ContributeGoalModal key={contributingId ?? 'closed'} open={Boolean(contributingGoal)} goal={contributingGoal} saving={saving} error={formError} onClose={() => { if (!saving) setContributingId(null); }} onSubmit={handleContribution} />
    <NewGoalModal open={modalOpen} goal={editingGoal} saving={saving} error={formError} onClose={() => { if (!saving) setModalOpen(false); }} onSubmit={(values) => void handleSave(values)} />
    {adjustingGoal && <GoalAmountModal key={adjustingGoal.id} goal={adjustingGoal} saving={saving} error={formError} onClose={() => { if (!saving) setAdjustingId(null); }} onSubmit={handleAdjustment} />}
    <ConfirmDialog open={Boolean(deletingGoal)} title="Excluir meta" description={'Excluir “' + (deletingGoal?.titulo ?? '') + '” e seu acompanhamento? Esta ação não movimenta dinheiro e não pode ser desfeita.'} saving={saving} error={error} onClose={() => { if (!saving) setDeletingGoal(null); }} onConfirm={() => void confirmDelete()} />
  </DashboardLayout>;
}
