# CifraWealth

Aplicação de controle financeiro com React, TypeScript e Tailwind. Usa a API Express + Prisma + MySQL do diretório vizinho CifraWealth_BackEnd.

## Executar

1. Configure e inicie o backend conforme o README dele.
2. Neste diretório, copie .env.example para .env e execute npm install e npm run dev.
3. Abra http://localhost:5173, cadastre uma conta e faça login.

A variável VITE_API_URL define a URL da API: http://localhost:3000/api no desenvolvimento local. A aplicação usa a API real por padrão, inclusive quando essa variável não foi preenchida (fallback local em desenvolvimento e /api na origem atual em produção). A ausência de configuração nunca ativa uma simulação. Em produção, configure a URL pública da API e reinicie/recompile após alterar variáveis VITE_.

Configure VITE_GOOGLE_CLIENT_ID com o mesmo identificador público usado pelo backend. Sem ele, o botão Google fica indisponível e o usuário pode entrar por e-mail/senha. Nunca coloque BREVO_API_KEY, JWT_SECRET ou EMAIL_VERIFICATION_SECRET no frontend: variáveis VITE_ são públicas no bundle.

## Cadastro por e-mail

O backend precisa ter a Brevo e os segredos configurados. Depois de cadastrar nome/e-mail/senha, abra o link recebido e informe a senha daquela tentativa para confirmar. Repetir um cadastro pendente após um minuto altera a senha e invalida os links anteriores; os links da versão antiga precisam ser reenviados. A página de confirmação permite solicitar outro link. Sem o provedor, cadastro e recuperação de senha informam indisponibilidade, inclusive em desenvolvimento. Consulte o README do backend para as variáveis necessárias.

Em Esqueceu a senha?, solicite o link e defina uma nova senha pela mensagem recebida. O link dura uma hora e só pode ser utilizado uma vez; trocar a senha também encerra as sessões anteriores. O texto da solicitação não revela se um e-mail possui conta. As rotas de termos e privacidade ficam disponíveis no cadastro e na página inicial.

## Navegação e aparência

O cabeçalho permanece visível ao rolar todas as abas autenticadas e reúne nome, perfil, notificações e a alternância entre claro e escuro. O ícone ao lado da logo, no topo do menu lateral, recolhe o menu mantendo seus ícones; a preferência persiste neste navegador. Quando recolhido, o topo exibe apenas o controle de expandir. O avatar no rodapé do menu abre o perfil. A saudação de boas-vindas aparece somente no dashboard; títulos, filtros e ações continuam em suas respectivas páginas. Os atalhos do dashboard abrem diretamente a criação de receita, despesa ou meta. No celular, a navegação fica na barra inferior.

Na primeira visita, o tema acompanha o dispositivo e responde às mudanças do sistema. Escolher claro ou escuro salva uma preferência neste navegador, que persiste após recarregar e sincroniza entre abas abertas. Em Perfil → Aparência, escolha Usar tema do dispositivo para voltar ao automático. As cores também se aplicam aos formulários, modais e gráficos. O sino consulta os dados atuais ao abrir: mostra metas em andamento vencidas ou com prazo nos próximos sete dias, além de transações pendentes. São lembretes na aplicação, sem envio de notificações externas.

As cores são definidas em src/styles/global.css: azul identifica ações e seleção; turquesa acompanha o progresso das metas; verde indica receitas e sucesso; vermelho/coral identifica despesas e erros; âmbar indica avisos. Os botões usam texto e hover próprios para cada tema, mantendo a logo original. Os campos têm uma cor de contorno separada das bordas decorativas. As legendas dos gráficos acompanham suas séries, com traços diferentes nas curvas e rótulos legíveis também nos períodos sem dados.

O atalho flutuante de ajuda abre a landing page em outra aba, preservando a página e os filtros da aba original. A landing mantém o acesso direto ao painel para usuários autenticados e não depende do histórico do navegador para voltar.

## Demonstração explícita

Para apresentar a interface sem backend, configure VITE_DEMO_MODE=true e reinicie o Vite. Um aviso visível identifica dados fictícios e login/e-mail simulados. Esses dados ficam no navegador, não são contas reais e não migram para o banco. Para voltar ao sistema real, use VITE_DEMO_MODE=false. Não use a demonstração para validar autenticação, isolamento de contas ou persistência no MySQL.

## Sprint 5 — Metas e Relatórios (05/10/2026 a 25/10/2026)

- Metas: criar, editar, excluir e registrar valores já guardados. O progresso persiste no banco e a meta é concluída quando o valor guardado alcança o objetivo. Aumentar o objetivo reabre a meta quando necessário. Datas e descrição opcionais podem ser removidas na edição.
- Registrar valor guardado acompanha uma reserva que o usuário já fez em sua conta ou investimento. Não realiza transferências bancárias, não debita o saldo e não cria receita ou despesa automaticamente.
- Relatórios: receitas, despesas, saldo, taxa de economia, evolução mensal, distribuição de despesas, comparativos e transações detalhadas. Somente transações confirmadas são incluídas. Datas inicial e final são inclusivas; intervalos inválidos e maiores que cinco anos são rejeitados.
- Presets de 3, 6 e 12 meses incluem o mês atual até hoje. Personalizado permite selecionar e aplicar datas exatas. As variações comparam o intervalo anterior de mesma duração; base zero aparece sem variação.
- Exportação CSV inclui resumo, meses, categorias, transações e situação atual das metas. A busca e o tipo na tabela filtram somente a tabela; a exportação inclui todas as transações do período aplicado.
- Todas as categorias pertencem ao usuário. Cada nova conta recebe suas próprias categorias iniciais; categorias com transações não podem ser excluídas nem mudar de tipo.
- Metas nos relatórios mostram o progresso acumulado atual, independente das datas selecionadas.

## Roteiro de teste manual

1. Em Metas, crie Reserva com objetivo de R$ 1.000,00 e prazo 25/10/2026.
2. Use Registrar valor guardado e informe R$ 250,00. Confira 25% e recarregue a página para verificar persistência.
3. Registre o restante com Completar meta. Confira 100% e o filtro Concluídas.
4. Em Categorias, crie uma receita Salário e uma despesa Mercado. Em Transações, registre receita de R$ 2.000,00 em 05/10/2026 e despesa de R$ 350,00 em 25/10/2026.
5. Em Relatórios, escolha Personalizado, aplique 05/10/2026 a 25/10/2026 e confira saldo de R$ 1.650,00, detalhes, gráficos e CSV.
6. Selecione somente 25/10/2026 para conferir saldo negativo; selecione um período sem transações para conferir o estado vazio. Inverta as datas para conferir a validação.

## Verificação automatizada

- npm run build: TypeScript e build de produção.
- npm run lint: ESLint.
- npm test: configuração de API/demonstração, regras dos lembretes, validações de datas, períodos e exportação CSV, sem depender do backend. Requer Node.js 22.18 ou superior.
- npm run test:e2e: Playwright no Chrome instalado, em desktop e celular. A configuração inicia instâncias exclusivas de API (3101) e Vite (5174), com modo demonstração desligado, além de uma instância de demonstração (5175) para validar seu isolamento. Os testes usam somente MySQL local com migrations aplicadas, criam contas temporárias verificadas e removem seus dados ao terminar. Cobrem menu, temas, atalhos, landing, informações e recuperação. O fluxo de envio é coberto por um servidor HTTP local na integração do backend; os testes de interface da recuperação interceptam a API. Não há envio externo de e-mails.
- Testes de cálculos, validações e integração da API ficam no backend.
## Correções de usabilidade

Transações podem ser criadas, editadas, pesquisadas, filtradas por tipo/situação/categoria/data e paginadas. A exclusão exige confirmação. Pendências podem ser confirmadas quando sua data não for futura. Os valores aceitam o padrão brasileiro (`1.000`, `1.234,56`, `0,01`) e decimais com ponto de até duas casas; o formulário normaliza a apresentação ao sair do campo.

Metas diferenciam novos aportes, correção do total e retirada. O valor posterior é apresentado antes de salvar. É possível cancelar/reativar a meta, consultar detalhes sem edição e ver o dia exato do prazo. O acompanhamento continua manual e não movimenta dinheiro. O histórico individual de movimentos, saldo inicial, edição da conta e tour permanecem no planejamento futuro.

O dashboard mostra lançamentos confirmados até hoje e conserva os blocos disponíveis em caso de falha parcial. Documentos do cadastro abrem em outra aba para preservar o formulário; o perfil continua acessível pelo avatar, com cinco destinos no menu móvel.

O React Router foi atualizado para a linha 7 corrigida, mantendo a aplicação React 18. Use Node 20 ou superior. `npm test` inclui regressões de valores monetários; `npm run test:e2e` cobre também edição, previsões, confirmação, exclusões, correção/retirada das metas, falhas parciais e textos no limite permitido.
