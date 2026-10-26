export const HELP_SECTIONS = [
  {
    id: 'dashboard', path: '/dashboard', label: 'Visão geral',
    title: 'Entenda seu resumo financeiro',
    steps: [
      'Comece registrando uma receita ou despesa. As categorias iniciais já estão prontas para usar.',
      'O saldo acumulado reúne os registros confirmados até hoje, de todos os meses. O resumo mensal considera apenas o mês indicado.',
      'Use o olho para ocultar seus valores. A preferência acompanha você nas outras telas.',
    ],
    note: 'A CifraWealth organiza registros manuais. Não consulta seu saldo bancário nem movimenta dinheiro.',
    action: 'Registrar movimentação', to: '/transactions?new=1',
  },
  {
    id: 'transactions', path: '/transactions', label: 'Transações',
    title: 'Registre e encontre suas movimentações',
    steps: [
      'Em “Nova Transação”, escolha receita ou despesa, informe valor, descrição, categoria e data.',
      'Registros confirmados até hoje entram no saldo. Pendentes aguardam sua confirmação; datas futuras aparecem como previstas.',
      'Busque pela descrição ou categoria. Em “Filtros”, selecione período e situação e conclua em “Aplicar filtros”.',
    ],
    note: 'Os totais acompanham os filtros e incluem todas as páginas de resultados. Editar ou excluir um registro atualiza os resumos.',
    action: 'Nova transação', to: '/transactions?new=1',
  },
  {
    id: 'categories', path: '/categories', label: 'Categorias',
    title: 'Organize seus registros por categoria',
    steps: [
      'Você pode usar as categorias iniciais desde o primeiro registro, sem configurar nada antes.',
      'Em “Análise”, consulte as categorias por valor ou quantidade. Use o seletor de despesas/receitas e escolha o período.',
      'Em “Minhas categorias”, crie ou edite suas categorias. Uma categoria de receita é usada em receitas; uma de despesa, em despesas.',
    ],
    note: 'As análises consideram registros confirmados no período. Uma categoria sem uso não significa erro ou configuração incompleta.',
    action: 'Gerenciar categorias', to: '/categories?view=manage',
  },
  {
    id: 'goals', path: '/goals', label: 'Metas',
    title: 'Acompanhe o que você está reservando',
    steps: [
      'Crie uma meta com o nome do objetivo e o valor que pretende alcançar. As datas ajudam a acompanhar seu plano.',
      'Deslize pelos cartões e escolha “Ver meta” para abrir o planejamento. “Guardar valor” abre a página da meta com o formulário para registrar o dinheiro já separado.',
      'Em “Gerenciar esta meta”, corrija o valor registrado, informe uma retirada ou cancele o acompanhamento. Revise os valores antes de confirmar.',
    ],
    note: 'Registrar dinheiro em uma meta não faz transferência nem cria uma despesa. O valor da meta não é descontado automaticamente do saldo.',
    action: 'Criar meta', to: '/goals?new=1',
  },
  {
    id: 'reports', path: '/reports', label: 'Relatórios',
    title: 'Analise um período e baixe seu relatório',
    steps: [
      'Escolha o período que quer analisar. Os indicadores e gráficos acompanham essa seleção.',
      'Use a visão geral para identificar evolução e distribuição dos valores, e o detalhamento para consultar os lançamentos.',
      'Baixe o PDF para guardar ou compartilhar o relatório completo do período selecionado.',
    ],
    note: 'Os resultados incluem registros confirmados até hoje. Metas atuais têm seu próprio contexto e não representam necessariamente o período do relatório.',
    action: 'Consultar relatórios', to: '/reports',
  },
  {
    id: 'profile', path: '/profile', label: 'Perfil e preferências',
    title: 'Cuide da sua conta e da aparência do site',
    steps: [
      'Edite seu nome, foto de perfil e capa. O e-mail identifica sua conta e não é alterado nessa tela.',
      'Escolha tema claro, escuro ou automático. No automático, a aparência acompanha o dispositivo.',
      'O botão de acessibilidade no cabeçalho permite ajustar leitura e movimento. O olho ao lado do e-mail controla sua exibição.',
    ],
    note: 'A exclusão da conta remove seus dados e exige confirmação de identidade. Leia a confirmação antes de prosseguir.',
    action: 'Abrir perfil', to: '/profile',
  },
] as const;

export function getHelpSection(idOrPath: string | null) {
  if (idOrPath?.startsWith('/goals/')) return HELP_SECTIONS[3];
  return HELP_SECTIONS.find((section) => section.id === idOrPath || section.path === idOrPath) ?? HELP_SECTIONS[0];
}
