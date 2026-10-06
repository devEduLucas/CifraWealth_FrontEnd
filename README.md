# CifraWealth

Aplicação de controle financeiro com React, TypeScript e Tailwind. Usa a API Express + Prisma + MySQL do diretório vizinho CifraWealth_BackEnd.

## Executar

1. Configure e inicie o backend conforme o README dele.
2. Neste diretório, execute npm install e npm run dev.
3. Abra http://localhost:5173, cadastre uma conta e faça login.

A variável opcional VITE_API_URL define a URL da API. Por padrão: http://localhost:3000/api. Exemplo de configuração em .env.example.

## Sprint 5 — Metas e Relatórios (05/10/2026 a 25/10/2026)

- Metas: criar, editar, excluir e registrar valores já guardados. O progresso persiste no banco e a meta é concluída quando o valor guardado alcança o objetivo. Aumentar o objetivo reabre a meta quando necessário. Datas e descrição opcionais podem ser removidas na edição.
- Registrar valor guardado acompanha uma reserva que o usuário já fez em sua conta ou investimento. Não realiza transferências bancárias, não debita o saldo e não cria receita ou despesa automaticamente.
- Relatórios: receitas, despesas, saldo, taxa de economia, evolução mensal, distribuição de despesas, comparativos e transações detalhadas. Somente transações confirmadas são incluídas. Datas inicial e final são inclusivas; intervalos inválidos e maiores que cinco anos são rejeitados.
- Presets de 3, 6 e 12 meses incluem o mês atual até hoje. Personalizado permite selecionar e aplicar datas exatas. As variações comparam o intervalo anterior de mesma duração; base zero aparece sem variação.
- Exportação CSV inclui resumo, meses, categorias, transações e situação atual das metas. A busca e o tipo na tabela filtram somente a tabela; a exportação inclui todas as transações do período aplicado.
- Categorias novas pertencem ao usuário. Categorias compartilhadas anteriores continuam visíveis, mas são somente leitura.
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
- npm test: validações de datas, períodos e exportação CSV, sem depender do backend. Requer Node.js 22.18 ou superior.
- npm run test:e2e: Playwright no Chrome instalado, em desktop e celular. A configuração inicia API e Vite se necessário. Os testes usam somente MySQL local, criam contas temporárias e removem os próprios dados ao terminar.
- Testes de cálculos, validações e integração da API ficam no backend.
