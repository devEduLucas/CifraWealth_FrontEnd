# Experiência de primeiro acesso

A revisão de outubro de 2026 prioriza orientação, clareza de períodos e acesso às ações frequentes, preservando o controle financeiro manual e os temas existentes.

- **Visão geral:** saldo acumulado antes dos atalhos, mês explícito, resumo compacto e orientação quando não existe nenhum lançamento. Saldo zero, pendências e registros futuros continuam sendo histórico.
- **Autenticação:** recuperação/redefinição visíveis no celular; cadastro, confirmação e e-mails explicam a mesma sequência. A ativação continua exigindo a senha cadastrada.
- **Navegação:** ajuda contextual no `?`, guia em `/help`, notificações com destino específico e cabeçalho mais compacto.
- **Organização:** filtros com ações fixas; transações compactas ou detalhadas; categorias com uso/gerenciamento; coleção horizontal de metas e alternativa em tabela; relatórios com visão geral/detalhamento; perfil com acesso direto às seções e miniaturas dos temas claro/escuro/automático.

Cada meta abre uma página em `/goals/:goalId` com progresso, valores, datas e gerenciamento. “Guardar valor” abre o formulário nessa página; criar uma meta leva ao seu planejamento. Links antigos com `detail` ou `contribute` continuam válidos. A coleção permite deslizar, usar as setas ou navegar pelo teclado, respeitando a preferência por movimento reduzido.

O gráfico de relatórios usa barras para um mês e linhas para vários meses. O saldo de cada mês é receitas menos despesas, sem acumular os meses anteriores. Uma tabela acessível permite conferir os números; ela acompanha o período e a privacidade. Os testes de navegador usam respostas fixas do contrato da API, com centavos e períodos mensal, de vários meses, negativo e vazio. Eles conferem a representação desses valores na interface, sem importar ou recalcular a agregação do backend. As regras de cálculo continuam cobertas pelos testes unitários do próprio backend.

Os PDFs e CSVs continuam completos, independentemente da visualização aberta. O controle de privacidade oculta valores na interface; os arquivos exportados incluem os valores e a tela informa essa diferença.

## Verificação local

```sh
npm test
npm run lint
npm run build
npm run test:ux
```

`test:ux` abre o Chrome e um Vite temporário em `127.0.0.1:5182`. Usa dados fictícios e intercepta as chamadas de API. Pode rodar com somente o repositório do frontend: não precisa dos arquivos ou do servidor do backend, nem do banco; não envia e-mails e não valida integração com provedores. Inclui desktop/celular, primeiro acesso, histórico zerado, pendências/futuros, filtros, teclado, texto ampliado, privacidade, confirmação e download de PDF. Chrome deve estar instalado no computador.

Os testes de integração existentes continuam disponíveis em `npm run test:e2e`, com suas dependências de backend/banco local. As duas suítes têm propósitos diferentes.

O tour permanece fora desta alteração. Uma rodada com pessoas que não conhecem o produto ainda é necessária para medir se a hierarquia reduz hesitações nas tarefas reais.
