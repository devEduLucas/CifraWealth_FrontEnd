export type OnboardingStatus = 'offered' | 'dismissed' | 'completed';
export type TourSection = 'dashboard' | 'transactions' | 'categories' | 'goals' | 'reports' | 'profile';

export interface TourStep {
  id: string;
  section: TourSection | 'help';
  to: string;
  target: string;
  title: string;
  description: string;
  detail: string;
}

export const TOUR_STEPS: readonly TourStep[] = [
  { id: 'summary', section: 'dashboard', to: '/dashboard', target: '[data-tour="dashboard-summary"]',
    title: 'Seu resumo financeiro',
    description: 'Aqui você acompanha o resultado dos seus registros. Ao começar, esta área mostra como adicionar a primeira movimentação.',
    detail: 'O saldo reúne receitas menos despesas confirmadas até hoje. Ele não consulta seu banco nem inclui pendências ou previsões.' },
  { id: 'first-record', section: 'dashboard', to: '/dashboard', target: '[data-tour="dashboard-actions"]',
    title: 'Comece pelos registros',
    description: 'Recebeu ou gastou? Use estes atalhos para registrar a movimentação com valor, data e categoria.',
    detail: 'O tour só apresenta os caminhos. Você decide quando criar seu primeiro registro.' },
  { id: 'transactions', section: 'transactions', to: '/transactions', target: '[data-tour="transactions-actions"]',
    title: 'Suas transações, do seu jeito',
    description: 'Nova Transação adiciona um registro. Na lista, toque em uma movimentação para consultar seus detalhes e ações.',
    detail: 'Use a busca e os filtros para encontrar lançamentos. A visão compacta funciona como um extrato; a detalhada mostra os cartões.' },
  { id: 'categories', section: 'categories', to: '/categories?view=manage', target: '[data-tour="categories-collections"]',
    title: 'Categorias para organizar e comparar',
    description: 'Escolha Despesas ou Receitas para gerenciar suas categorias. Elas já vêm prontas para você começar.',
    detail: 'Na aba Análise, compare entradas e saídas e veja os grupos que mais participam das suas movimentações.' },
  { id: 'goals', section: 'goals', to: '/goals', target: '[data-tour="goals-collection"]',
    title: 'Um espaço para cada objetivo',
    description: 'Crie uma meta e abra seu planejamento para acompanhar o progresso ou registrar o valor que já separou.',
    detail: 'Guardar valor apenas atualiza o acompanhamento. Não transfere dinheiro nem desconta automaticamente do saldo.' },
  { id: 'reports', section: 'reports', to: '/reports', target: '[data-tour="reports-period"]',
    title: 'Relatórios do período que você escolher',
    description: 'Escolha o período para analisar receitas, despesas e resultado. O detalhamento mostra os registros que compõem os totais.',
    detail: 'PDF e CSV incluem os valores completos do período, mesmo quando você os oculta na tela.' },
  { id: 'profile', section: 'profile', to: '/profile', target: '[data-tour="profile-summary"]',
    title: 'Seu perfil e suas preferências',
    description: 'No perfil, edite seu nome, avatar e capa. Mais abaixo, escolha aparência clara, escura ou automática.',
    detail: 'Os ajustes de acessibilidade ficam no cabeçalho. O olho controla a exibição de informações financeiras e do e-mail.' },
  { id: 'help', section: 'help', to: '/help', target: '[data-tour="help-center"]',
    title: 'Ajuda sempre por perto',
    description: 'Pesquise uma dúvida ou escolha um assunto para ver instruções e respostas. Você pode repetir este tour sempre que quiser.',
    detail: 'O botão de interrogação também abre a ajuda da tela em que você está. Ao concluir, você volta ao ponto de partida.' },
];

export function getTourSteps(section?: string): readonly TourStep[] {
  const selected = section ? TOUR_STEPS.filter((step) => step.section === section) : [];
  return selected.length ? selected : TOUR_STEPS;
}

export function onboardingKey(userId: number): string {
  if (!Number.isInteger(userId) || userId <= 0) throw new Error('Identificador inválido para o guia.');
  return `cifrawealth:onboarding:v1:${userId}`;
}

export function readOnboardingStatus(userId: number, storage?: Pick<Storage, 'getItem'>): OnboardingStatus | null {
  try {
    const target = storage ?? (typeof window !== 'undefined' ? window.localStorage : null);
    const value: unknown = JSON.parse(target?.getItem(onboardingKey(userId)) ?? 'null');
    if (!value || typeof value !== 'object' || !('status' in value)) return null;
    return ['offered', 'dismissed', 'completed'].includes(String(value.status)) ? value.status as OnboardingStatus : null;
  } catch { return null; }
}

export function writeOnboardingStatus(userId: number, status: OnboardingStatus, storage?: Pick<Storage, 'setItem'>): boolean {
  try {
    const target = storage ?? (typeof window !== 'undefined' ? window.localStorage : null);
    if (!target) return false;
    target.setItem(onboardingKey(userId), JSON.stringify({ status }));
    return true;
  } catch { return false; }
}
