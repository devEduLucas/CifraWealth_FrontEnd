# Experiência de primeiro acesso

A revisão de outubro de 2026 prioriza orientação, clareza de períodos e acesso às ações frequentes, preservando o controle financeiro manual e os temas existentes.

- **Visão geral:** saldo acumulado antes dos atalhos, mês explícito, resumo compacto e orientação quando não existe nenhum lançamento. Saldo zero, pendências e registros futuros continuam sendo histórico.
- **Autenticação:** recuperação/redefinição visíveis no celular; cadastro, confirmação e e-mails explicam a mesma sequência. A ativação continua exigindo a senha cadastrada.
- **Navegação:** ajuda contextual no `?`, guia em `/help`, notificações com destino específico e cabeçalho mais compacto.
- **Organização:** filtros com ações fixas; transações em linhas compactas com detalhes ao clicar ou em cartões detalhados; categorias começam por Minhas categorias com coleções de despesas/receitas e análise conjunta; coleção horizontal de metas e alternativa em tabela; relatórios com visão geral/detalhamento e destaques sob as categorias; perfil com resumo visual, acesso direto às seções e miniaturas dos temas claro/escuro/automático.

Cada meta abre uma página em `/goals/:goalId` com progresso, valores, datas e gerenciamento. “Guardar valor” abre o formulário nessa página; criar uma meta leva ao seu planejamento. Links antigos com `detail` ou `contribute` continuam válidos. A coleção permite deslizar, usar as setas ou navegar pelo teclado, respeitando a preferência por movimento reduzido.

O gráfico de relatórios usa barras para um mês e linhas para vários meses. O saldo de cada mês é receitas menos despesas, sem acumular os meses anteriores. Uma tabela acessível permite conferir os números; ela acompanha o período e a privacidade. Os testes de navegador usam respostas fixas do contrato da API, com centavos e períodos mensal, de vários meses, negativo e vazio. Eles conferem a representação desses valores na interface, sem importar ou recalcular a agregação do backend. As regras de cálculo continuam cobertas pelos testes unitários do próprio backend.

Os PDFs e CSVs continuam completos, independentemente da visualização aberta. O controle de privacidade oculta valores na interface; os arquivos exportados incluem os valores e a tela informa essa diferença.

Os destaques visuais usam azul para saldo/resultados, verde para receitas e coral para despesas. As coleções de categorias têm gradientes próprios; indicadores usam fundos suaves com bordas coloridas. Alto contraste remove os gradientes e preserva os rótulos e ícones. Nos relatórios em desktop, gráficos compartilham uma linha e o acesso ao detalhamento fica alinhado aos destaques na linha seguinte, inclusive em períodos sem dados.

## Verificação local

```sh
npm test
npm run lint
npm run build
npm run test:ux
```

`test:ux` abre o Chrome e um Vite temporário em `127.0.0.1:5182`. Usa dados fictícios e intercepta as chamadas de API. Pode rodar com somente o repositório do frontend: não precisa dos arquivos ou do servidor do backend, nem do banco; não envia e-mails e não valida integração com provedores. Inclui desktop/celular, primeiro acesso, histórico zerado, pendências/futuros, filtros, teclado, texto ampliado, privacidade, confirmação e download de PDF. Chrome deve estar instalado no computador.

A revisão de novembro acrescenta navegação e edição das coleções de categorias, comparação conjunta sem pendências, diferença de altura entre as densidades de transações, ações pelos detalhes, descrições extensas e valores máximos em 320px, resumo visual com centavos e falha parcial no perfil e continuidade entre categorias e destaques no relatório.

Os cenários de cores conferem os dois temas, contraste dos textos nos gradientes, preferência de alto contraste e alinhamento da base dos relatórios com dados e vazios em desktop/celular.

Os testes de integração existentes continuam disponíveis em `npm run test:e2e`, com suas dependências de backend/banco local. As duas suítes têm propósitos diferentes.

O tour permanece fora desta alteração. Uma rodada com pessoas que não conhecem o produto ainda é necessária para medir se a hierarquia reduz hesitações nas tarefas reais.
