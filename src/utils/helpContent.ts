export const HELP_SECTIONS = [
  {
    id: 'dashboard', path: '/dashboard', label: 'Visão geral',
    title: 'Entenda seu resumo financeiro',
    keywords: ['saldo', 'primeiro acesso', 'começar', 'receita', 'despesa', 'olho'],
    steps: [
      'Comece registrando uma receita ou despesa nas ações rápidas. As categorias iniciais já estão prontas para usar.',
      'O saldo acumulado reúne os registros confirmados até hoje, de todos os meses. O resumo mensal considera apenas o mês indicado.',
      'Use o olho para ocultar os valores. A preferência acompanha você nas outras telas.',
    ],
    note: 'A CifraWealth organiza registros manuais. Não consulta seu saldo bancário nem movimenta dinheiro.',
    action: 'Registrar movimentação', to: '/transactions?new=1',
    questions: [
      { id: 'saldo-banco', question: 'Esse saldo é o mesmo da minha conta bancária?', answer: 'Ele é a diferença entre as receitas e despesas que você registrou e confirmou até hoje. Não existe conexão automática com o banco. Para refletir sua organização, mantenha os lançamentos atualizados.' },
      { id: 'saldo-mes', question: 'Por que o saldo acumulado difere do resultado do mês?', answer: 'O saldo acumulado considera todos os meses registrados. O resultado do mês usa apenas as receitas e despesas do mês exibido. Um mês negativo pode coexistir com saldo acumulado positivo.' },
      { id: 'primeiro-registro', question: 'Preciso criar categorias e metas antes de começar?', answer: 'Não. Você pode registrar a primeira movimentação com uma categoria inicial. Personalizar categorias e criar metas são escolhas que podem ficar para depois.' },
      { id: 'saldo-zero', question: 'Saldo zero significa que meus dados sumiram?', answer: 'Não necessariamente. Receitas e despesas podem ter o mesmo total. Registros pendentes ou futuros também não compõem o saldo realizado. Confira suas transações e os filtros antes de cadastrar novamente.' },
    ],
  },
  {
    id: 'transactions', path: '/transactions', label: 'Transações',
    title: 'Registre e encontre suas movimentações',
    keywords: ['lançamento', 'extrato', 'filtro', 'confirmar', 'pendente', 'prevista', 'compacta', 'editar', 'excluir'],
    steps: [
      'Em “Nova Transação”, escolha receita ou despesa e informe descrição, valor, categoria e data.',
      'Confirmados até hoje entram no saldo. Pendentes aguardam sua confirmação; datas futuras aparecem como previstas.',
      'Na visão compacta, toque no lançamento para ver detalhes e ações. Em “Filtros”, escolha o período, tipo, categoria e situação; confirme em “Aplicar filtros”.',
    ],
    note: 'Os totais acompanham os filtros e incluem todas as páginas de resultados. Editar, confirmar ou excluir um registro atualiza os resumos.',
    action: 'Nova transação', to: '/transactions?new=1',
    questions: [
      { id: 'confirmada-pendente', question: 'Qual a diferença entre confirmada, pendente e prevista?', answer: 'Confirmada é uma movimentação que você já reconhece como recebida ou paga. Pendente ainda precisa de confirmação. Prevista tem data futura; o formulário mantém esse lançamento pendente. Quando a data chegar, revise e confirme para incluí-lo no saldo.' },
      { id: 'corrigir-transacao', question: 'Como corrigir ou excluir um lançamento?', answer: 'Na visão compacta, abra a linha e escolha Editar ou Excluir. Na detalhada, use as ações do cartão. A exclusão pede confirmação e retira o lançamento dos totais. Se apenas o valor estiver errado, prefira editar.' },
      { id: 'transacao-nao-aparece', question: 'Não encontrei uma transação. O que conferir?', answer: 'Confira a busca, os filtros aplicados e as outras páginas da lista. Limpar os filtros amplia os resultados. Se a lista estiver compacta, abra a linha para consultar todas as informações. Uma pendência pode aparecer na lista sem entrar nos totais confirmados.' },
      { id: 'filtro-cancelar', question: 'Escolher um filtro já altera a lista?', answer: 'Não. A janela mantém um rascunho até você escolher Aplicar filtros. Cancelar preserva a seleção anterior. Os filtros aplicados ficam na URL; a busca por texto pertence à tela atual.' },
      { id: 'compacta-detalhada', question: 'Quando usar a visão compacta ou detalhada?', answer: 'A compacta reúne mais lançamentos em linhas e abre os detalhes ao tocar. A detalhada apresenta cartões com mais informações e ações diretas. A sua escolha fica salva neste navegador.' },
    ],
  },
  {
    id: 'categories', path: '/categories', label: 'Categorias',
    title: 'Organize seus registros por categoria',
    keywords: ['classificar', 'despesas', 'receitas', 'ranking', 'análise', 'ícone', 'cor', 'duplicada'],
    steps: [
      'Em “Minhas categorias”, escolha Despesas ou Receitas para consultar, criar e editar suas categorias.',
      'Personalize nome, ícone e cor. Use “Todas as categorias” para voltar e escolher o outro tipo.',
      'Em “Análise”, compare receitas e despesas do mesmo período ou selecione um tipo para conferir seu ranking.',
    ],
    note: 'As análises consideram registros confirmados no período até hoje. Uma categoria sem uso não significa erro ou configuração incompleta.',
    action: 'Gerenciar categorias', to: '/categories?view=manage',
    questions: [
      { id: 'tipo-categoria', question: 'Por que receitas e despesas têm categorias separadas?', answer: 'Cada categoria pertence a um tipo de movimentação. Isso evita, por exemplo, classificar uma despesa como salário. Ao criar uma transação, a lista mostra as categorias compatíveis com o tipo escolhido.' },
      { id: 'categoria-vinculada', question: 'Por que não consigo excluir uma categoria?', answer: 'Categorias com transações vinculadas são protegidas para manter o histórico. Primeiro revise esses lançamentos e, se fizer sentido, mova-os para outra categoria do mesmo tipo. Não apague transações corretas apenas para remover uma categoria.' },
      { id: 'ranking-categorias', question: 'O que significam “Por valor” e “Por quantidade”?', answer: 'Por valor destaca onde houve maior total em reais. Por quantidade destaca o número de lançamentos confirmados. O período e o tipo selecionados valem para a análise; os percentuais consideram todas as categorias daquele tipo, inclusive as que ficaram fora das cinco principais.' },
      { id: 'abrir-categoria', question: 'Como ver os lançamentos de uma categoria?', answer: 'Na análise, toque em uma categoria do ranking para abrir as transações com o período e a situação confirmada preservados. No gerenciamento, o atalho abre o histórico completo da categoria, sem restringir ao período da análise.' },
      { id: 'mudar-tipo-categoria', question: 'Posso mudar uma categoria de despesa para receita?', answer: 'Se ela já possui transações, o tipo é protegido para não tornar o histórico inconsistente. Nesse caso, crie ou escolha outra categoria do tipo correto e revise os lançamentos individualmente.' },
    ],
  },
  {
    id: 'goals', path: '/goals', label: 'Metas',
    title: 'Acompanhe o que você está reservando',
    keywords: ['guardar', 'reserva', 'objetivo', 'progresso', 'retirada', 'aporte', 'cancelar', 'cofrinho'],
    steps: [
      'Crie uma meta com o nome do objetivo e o valor que pretende alcançar. As datas ajudam a acompanhar seu plano.',
      'Deslize pelos cartões e escolha “Ver meta” para abrir o planejamento. “Guardar valor” abre o formulário do dinheiro já separado.',
      'Em “Gerenciar esta meta”, corrija o total guardado, registre uma retirada ou cancele o acompanhamento. Revise os valores antes de confirmar.',
    ],
    note: 'Registrar dinheiro em uma meta não faz transferência nem cria uma despesa. O valor da meta não é descontado automaticamente do saldo.',
    action: 'Criar meta', to: '/goals?new=1',
    questions: [
      { id: 'dinheiro-meta', question: 'O dinheiro fica aplicado ou guardado pela CifraWealth?', answer: 'Não. A meta é um acompanhamento do valor que você já separou fora do site. A CifraWealth não recebe, investe ou transfere esse dinheiro.' },
      { id: 'valor-guardado', question: '“Guardar valor” soma ou substitui o total?', answer: 'Guardar valor adiciona a quantia informada ao que já está registrado. Para substituir um total incorreto, use Gerenciar esta meta e a opção de ajustar o valor guardado. Para diminuir porque utilizou parte da reserva, registre uma retirada.' },
      { id: 'progresso-meta', question: 'Como o progresso é calculado?', answer: 'O progresso compara o valor atual guardado com o valor objetivo. Registrar mais dinheiro aumenta o acompanhamento; uma retirada ou correção pode reduzi-lo. Ao alcançar o objetivo, a meta é concluída.' },
      { id: 'cancelar-meta', question: 'Cancelar uma meta apaga os valores?', answer: 'Cancelar interrompe o acompanhamento e preserva seus valores. Você pode revisar a meta e reativá-la. Excluir é outra ação e pede confirmação antes de remover a meta.' },
      { id: 'prazo-meta', question: 'Uma meta vencida movimenta ou retira dinheiro?', answer: 'Não. O prazo ajuda a identificar o que precisa de atenção, mas não faz qualquer operação financeira. Revise seu planejamento e, se necessário, ajuste as datas ou o objetivo.' },
    ],
  },
  {
    id: 'reports', path: '/reports', label: 'Relatórios',
    title: 'Analise um período e baixe seu relatório',
    keywords: ['pdf', 'csv', 'baixar', 'gerar', 'download', 'exportar', 'gráfico', 'datas', 'período', 'planilha'],
    steps: [
      'Escolha o período do relatório. Em Personalizado, informe as duas datas e escolha “Aplicar datas”.',
      'Use a visão geral para analisar a evolução e as despesas por categoria. Abra o detalhamento para consultar transações, histórico e comparação mensal.',
      'Baixe o PDF para guardar ou compartilhar o relatório completo. O CSV permite abrir os dados em uma planilha.',
    ],
    note: 'PDF e CSV incluem os valores completos, mesmo com a privacidade ativada na tela. Confira o arquivo antes de compartilhar.',
    action: 'Consultar relatórios', to: '/reports',
    questions: [
      { id: 'periodo-relatorio', question: 'Quais registros entram no relatório?', answer: 'Entram os registros confirmados dentro das datas escolhidas, até hoje. As datas inicial e final são incluídas. Pendências e movimentações futuras não entram nos realizados. As metas mostram a situação atual e têm indicação separada do período.' },
      { id: 'pdf-filtros', question: 'A busca do detalhamento também filtra o PDF e o CSV?', answer: 'Não. A busca e o tipo da tabela ajudam a consultar os dados na tela. O PDF e o CSV preservam todos os lançamentos confirmados do período aplicado, mesmo os que estão em outras páginas da tabela.' },
      { id: 'relatorio-vazio', question: 'Por que o relatório está vazio?', answer: 'Confira as datas e se existem registros confirmados nesse intervalo. Se só houver pendências ou previsões, o resultado realizado pode ser zero. Você pode selecionar outro período ou revisar a situação dos lançamentos nas transações.' },
      { id: 'grafico-valores', question: 'Como consultar os números sem depender do gráfico?', answer: 'Abra “Ver valores do gráfico” na evolução financeira ou “Ver valores do comparativo mensal” no detalhamento. As tabelas apresentam os dados em texto. Em períodos longos, o comparativo mensal também permite rolar entre os meses.' },
      { id: 'falha-pdf', question: 'O PDF não foi gerado. Como tentar novamente?', answer: 'Aguarde o relatório terminar de carregar, confira a conexão e tente baixar novamente. A geração precisa carregar os recursos do documento. A falha de download não apaga seus registros; o CSV continua sendo uma opção de exportação quando estiver disponível.' },
    ],
  },
  {
    id: 'profile', path: '/profile', label: 'Perfil e preferências',
    title: 'Cuide da sua conta e da aparência do site',
    keywords: ['nome', 'foto', 'avatar', 'capa', 'imagem', 'tema', 'aparência', 'email'],
    steps: [
      'Edite seu nome, foto do avatar e capa. As mudanças são salvas quando você confirma a edição.',
      'Escolha tema claro, escuro ou automático. No automático, a aparência acompanha o dispositivo.',
      'Consulte seu momento financeiro e abra o relatório do mês. Use o olho ao lado do e-mail para controlar a exibição do endereço.',
    ],
    note: 'O e-mail identifica a sua conta e é somente para consulta. O perfil não permite trocar esse endereço.',
    action: 'Abrir perfil', to: '/profile',
    questions: [
      { id: 'fotos-perfil', question: 'Quais imagens posso usar no perfil?', answer: 'Você pode escolher JPG, PNG ou WebP de até 5 MB. O navegador recorta e reduz a imagem antes de salvar. A capa também oferece opções prontas e cores. Se remover a foto ou a capa, a apresentação padrão é restaurada.' },
      { id: 'salvar-perfil', question: 'Uma falha ao salvar apagou minha edição?', answer: 'O formulário preserva o rascunho para que você possa conferir os dados e tentar novamente. O perfil exibido fora da janela continua mostrando o que foi salvo por último no servidor.' },
      { id: 'tema-automatico', question: 'Como deixar o tema igual ao do computador ou celular?', answer: 'No perfil, selecione a aparência Sistema. Essa opção acompanha a preferência clara ou escura do dispositivo. Selecionar Claro ou Escuro mantém uma escolha manual neste navegador.' },
      { id: 'momento-financeiro', question: 'Por que o valor das metas difere do resultado do mês?', answer: 'O resultado compara receitas e despesas realizadas no mês indicado. O valor guardado das metas representa a reserva atual acompanhada nas metas ativas. São informações com contextos diferentes e uma não é descontada automaticamente da outra.' },
    ],
  },
  {
    id: 'account', path: '/account-help', label: 'Conta e segurança',
    title: 'Acesse e proteja sua conta',
    keywords: ['cadastro', 'confirmar email', 'confirmação', 'senha', 'esqueci senha', 'recuperar', 'entrar', 'google', 'excluir conta'],
    steps: [
      'No cadastro, informe um e-mail que você consiga acessar e repita a mesma senha nos dois campos. O site indica os campos que precisam de correção.',
      'Abra a confirmação recebida por e-mail e informe a senha daquele cadastro. Depois, faça login.',
      'Se esquecer a senha, use “Esqueceu a senha?” na tela de entrada e siga o link recebido. Não compartilhe senhas, tokens ou links de recuperação.',
    ],
    note: 'A CifraWealth nunca precisa que você informe a senha do seu e-mail ou do Google em um formulário do projeto.',
    action: 'Consultar minha conta', to: '/profile',
    questions: [
      { id: 'email-nao-chegou', question: 'Não recebi o e-mail de confirmação. O que faço?', answer: 'Confira o endereço digitado e as pastas Spam e Promoções. Na tela de confirmação, você pode corrigir o e-mail ou solicitar outro envio após o tempo de espera indicado. Use a mensagem mais recente. Se o site informar indisponibilidade de envio, tente novamente mais tarde.' },
      { id: 'link-confirmacao', question: 'O link de confirmação venceu ou não funciona?', answer: 'O link de confirmação vale por 24 horas e exige a senha usada naquela tentativa de cadastro. Repetir um cadastro pendente com outra senha invalida os links anteriores. Solicite uma nova confirmação e use a mensagem e a senha correspondentes.' },
      { id: 'recuperar-senha', question: 'Como redefinir a senha?', answer: 'Se estiver conectado, saia da conta. Na tela Entrar, escolha Esqueceu a senha?, informe o e-mail e abra a mensagem recebida. O link de recuperação vale por uma hora e pode ser usado uma vez. Após trocar a senha, entre novamente; as sessões antigas são encerradas.' },
      { id: 'senha-google', question: 'Entrei com Google. Preciso criar ou informar a senha do Google?', answer: 'Não informe a senha do Google no site. O acesso acontece na janela oficial de identificação do Google. Algumas contas usam apenas esse acesso e não possuem uma senha local da CifraWealth.' },
      { id: 'excluir-conta', question: 'Como excluir minha conta e o que será removido?', answer: 'No perfil, escolha a opção de exclusão e leia a confirmação. Contas com senha local devem informar essa senha; contas exclusivas do Google confirmam a identidade novamente. A exclusão remove a conta, transações, categorias e metas. Ela só termina depois da confirmação do servidor.' },
    ],
  },
  {
    id: 'accessibility', path: '/accessibility-help', label: 'Leitura e acessibilidade',
    title: 'Ajuste a leitura e navegue do seu jeito',
    keywords: ['acessibilidade', 'contraste', 'texto', 'letra', 'movimento', 'animação', 'teclado', 'libras', 'privacidade', 'ocultar'],
    steps: [
      'Abra Acessibilidade no cabeçalho para ajustar o tamanho do texto, o contraste e a redução de movimentos.',
      'Use Tab para percorrer as ações e Enter para ativá-las. As janelas permitem sair com Escape e devolvem o foco ao botão de origem.',
      'Abra novamente este guia ou o tour quando quiser. Você pode interromper o tour e continuar usando o site normalmente.',
    ],
    note: 'As preferências de leitura, aparência e privacidade ficam neste navegador. Confira esses ajustes ao usar outro dispositivo.',
    action: 'Abrir preferências do perfil', to: '/profile',
    questions: [
      { id: 'acessibilidade-onde', question: 'Onde está o botão de acessibilidade?', answer: 'Dentro da conta, ele fica no cabeçalho, junto aos controles de tema, notificações e perfil. Nas páginas públicas, aparece como um botão flutuante. O VLibras é uma ferramenta complementar disponibilizada pelo serviço oficial.' },
      { id: 'reduzir-movimentos', question: 'O que muda ao reduzir movimentos?', answer: 'A opção reduz animações e evita rolagens suaves programáticas, como no carrossel das metas e na paginação. A preferência de reduzir movimentos do próprio dispositivo também é respeitada.' },
      { id: 'privacidade-valores', question: 'Ocultar valores também protege os arquivos baixados?', answer: 'Não. O olho oculta os valores e visualizações financeiras na interface, mas não remove os números dos arquivos PDF ou CSV. Confira o conteúdo antes de compartilhar um relatório.' },
      { id: 'tour-repetir', question: 'Posso pular ou fazer o tour novamente?', answer: 'Sim. O convite aparece uma vez por conta neste navegador e o tour é opcional. Você pode encerrá-lo a qualquer momento. Para repetir, abra esta central e escolha Iniciar tour guiado; os assuntos das telas principais também oferecem um tour da área. O guia não cria registros nem altera suas finanças.' },
    ],
  },
  {
    id: 'troubleshooting', path: '/troubleshooting-help', label: 'Resolver um problema',
    title: 'Confira o que fazer quando algo não funciona',
    keywords: ['erro', 'falha', 'indisponível', 'conexão', 'servidor', 'sessão', 'sumiu', 'carregando', 'duplicado'],
    steps: [
      'Leia a mensagem exibida e confira a conexão. Use “Tentar novamente” quando essa ação estiver disponível.',
      'Se uma informação parecer ausente, revise o período, os filtros, a paginação e a situação do lançamento.',
      'Se a sessão expirou, entre novamente. Se o erro persistir, informe à equipe a tela e o texto do erro, sem incluir senhas ou links de acesso.',
    ],
    note: 'Uma falha de carregamento ou download não significa que os dados foram apagados. Antes de repetir um cadastro ou lançamento, confira se ele já foi salvo.',
    action: 'Voltar à visão geral', to: '/dashboard',
    questions: [
      { id: 'sessao-expirada', question: 'Por que o site me levou de volta para Entrar?', answer: 'A sessão pode ter expirado ou ter sido encerrada após uma mudança de senha ou exclusão da conta. Faça login novamente com as credenciais atuais. Uma falha temporária do servidor, por si só, não deve ser tratada como senha incorreta.' },
      { id: 'erro-servidor', question: 'Apareceu “erro interno no servidor”. Minha senha está errada?', answer: 'Essa mensagem indica que o servidor não conseguiu concluir a operação; ela não comprova senha incorreta. Tente novamente mais tarde. Se continuar, encaminhe à equipe a mensagem e a ação em que ocorreu, sem enviar sua senha.' },
      { id: 'dados-dispositivos', question: 'Meus dados deveriam aparecer em outro computador?', answer: 'Os registros salvos no servidor ficam na conta usada naquele ambiente. Entre com a mesma conta no mesmo site. Um ambiente local pode usar um servidor e banco diferentes dos do site publicado; nesse caso, os históricos não são compartilhados automaticamente.' },
      { id: 'parte-resumo-falhou', question: 'Uma parte do resumo falhou, mas outras informações aparecem. Posso continuar?', answer: 'As partes disponíveis podem continuar sendo consultadas. Use a ação de tentar novamente para carregar o que faltou. Evite interpretar uma parte indisponível como valor zero e não cadastre registros repetidos para corrigir uma falha de carregamento.' },
    ],
  },
] as const;

export type HelpSection = typeof HELP_SECTIONS[number];
export type HelpSectionId = HelpSection['id'];

export function getHelpSection(idOrPath: string | null): HelpSection {
  if (idOrPath?.startsWith('/goals/')) return HELP_SECTIONS[3];
  return HELP_SECTIONS.find((section) => section.id === idOrPath || section.path === idOrPath) ?? HELP_SECTIONS[0];
}

export function normalizeHelpSearch(value: string): string {
  return value.trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\be mail\b/g, 'email');
}

export function searchHelp(query: string) {
  const words = normalizeHelpSearch(query).split(/\s+/).filter(Boolean);
  const connectingWords = new Set(['a', 'o', 'as', 'os', 'de', 'da', 'do', 'das', 'dos', 'em', 'um', 'uma', 'meu', 'minha', 'meus', 'minhas', 'como', 'por', 'para', 'porque', 'que', 'na', 'no', 'nas', 'nos', 'e', 'ao', 'com', 'se', 'x']);
  const keywords = words.filter((word) => !connectingWords.has(word));
  const terms = keywords.length ? keywords : words;
  if (!terms.length) return [];
  return HELP_SECTIONS.flatMap((section) => {
    const overview = normalizeHelpSearch([section.label, section.title, ...section.keywords, ...section.steps, section.note].join(' '));
    const questions = section.questions.filter((item) => {
      const text = normalizeHelpSearch(item.question + ' ' + item.answer);
      return terms.every((term) => text.includes(term));
    });
    return terms.every((term) => overview.includes(term)) || questions.length ? [{ section, questions }] : [];
  });
}
