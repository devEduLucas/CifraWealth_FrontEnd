# Tour e Ajuda

O tour apresenta o uso do produto nas telas reais, incluindo contas sem transações ou metas. Ele não injeta exemplos nem altera dados financeiros.

## Experiência de uso

- O convite aparece após um login quando essa conta ainda não recebeu o guia neste navegador. Uma sessão já restaurada não recebe um modal inesperado ao recarregar uma página.
- A pessoa escolhe **Conhecer o site** ou **Explorar por conta própria**. Fechar ou usar Escape também dispensa o convite.
- O tour completo percorre resumo, primeiro registro, transações, categorias, metas, relatórios, perfil e Ajuda. Não exige categorias adicionais, saldo ou metas já preenchidas.
- **Próximo**, **Voltar**, **Sair do tour** e **Concluir** permanecem dentro do diálogo. Na tela pequena, o texto rola internamente e os controles continuam disponíveis.
- O elemento destacado é apenas uma referência visual. O restante do aplicativo fica temporariamente isolado; criar, excluir, guardar valores, exportar ou mudar preferências exige uma ação posterior do usuário.
- Sair ou concluir restaura o endereço, a rolagem e o foco do ponto de partida. Os passos usam navegação com substituição, sem adicionar oito entradas ao histórico. Uma ação de Voltar no navegador encerra o guia e respeita a navegação.
- A Ajuda oferece replay completo e guias de uma área. O botão de interrogação também abre o guia contextual.

## Persistência e sessão

`src/utils/onboarding.ts` define as etapas e a chave `cifrawealth:onboarding:v1:<id_usuario>`. O valor contém apenas o estado `offered`, `dismissed` ou `completed`. Não guarda senha, token, valores financeiros ou conteúdo dos registros.

O estado é por conta e navegador, sem sincronização entre dispositivos. Falhas de leitura/gravação não impedem login ou uso do aplicativo. Uma memória temporária evita repetir o convite no mesmo ciclo do aplicativo quando o armazenamento está bloqueado; um novo documento sem armazenamento durável pode voltar a oferecê-lo após outro login.

O provider global observa a transição da conta na sessão, fecha o guia quando ela muda e aguarda outros diálogos antes de apresentar o convite automático. O guia pode ser iniciado manualmente a qualquer momento pela Ajuda.

## Âncoras e acessibilidade

Os elementos usam atributos `data-tour`, sem dependência da posição de um botão ou da quantidade de registros. O dashboard vazio tem âncoras equivalentes às do saldo e atalhos normais. Categorias abre sem filtro de tipo e metas pode mostrar a coleção vazia.

O diálogo mantém o mesmo elemento entre etapas, usa o gerenciamento de foco já adotado pelo projeto, suporta Escape e isola a navegação ao fundo. A rolagem é instantânea, inclusive quando o CSS da página usa movimento suave. O destaque acompanha resize e scroll, fica limitado à viewport e não depende de informações financeiras visíveis.

Quando uma área demora para carregar ou está indisponível, o guia mostra a explicação e permite continuar. Se a área aparecer depois, o destaque é atualizado. Textos ampliados, telas de 320 px e temas claro/escuro são cobertos pelas verificações de interface.

## Conteúdo da central

`src/utils/helpContent.ts` mantém os seis assuntos originais e acrescenta conta/segurança, leitura/acessibilidade e solução de problemas. São 41 respostas com links para ações existentes. O conteúdo explica registros manuais, saldo acumulado e mensal, previsões, metas sem transferências, filtros, PDF/CSV completos, privacidade, perfil, confirmação, recuperação e exclusão da conta.

A pesquisa normaliza acentos e pontuação e desconsidera palavras de ligação em consultas como “Esqueci minha senha”. Os parâmetros `section`, `q` e `question` preservam o contexto. Um resultado de pergunta abre o detalhe e direciona o foco à resposta. O texto é renderizado pelo React, sem interpretar HTML da busca ou da URL.

## Verificação

- `test/onboarding.test.mjs`: etapas somente de leitura, preferência por conta, armazenamento inválido/bloqueado e busca dos assuntos.
- `e2e/onboarding-help.spec.ts`: convite, dispensa, contas diferentes, replay, oito rotas, guias de uma área, histórico/foco, teclado, telas pequenas, carregamento lento, armazenamento bloqueado, coexistência com outro diálogo, privacidade e busca.
- `npm run test:ux` inclui os testes novos junto aos cenários financeiros existentes, em desktop e celular, com respostas da API simuladas e chamadas externas bloqueadas.

Na revisão desta implementação, passaram 46 testes unitários e 140 cenários de navegador, incluindo 26 cenários do tour/Ajuda. ESLint, TypeScript e build de produção também passaram. A revisão local com axe verificou convite, etapas e busca em 20 combinações de tela/tema, incluindo texto ampliado e alto contraste, sem violações nas regras WCAG A/AA executadas. As capturas foram inspecionadas; os controles permanecem disponíveis em 320 px.

O build mantém o aviso do pacote principal acima de 500 kB (549,26 kB nesta revisão), sem impedir a geração. A verificação do tour utiliza dados simulados e não altera contas, envia e-mails ou grava no banco.

Essa funcionalidade não requer pacotes adicionais, alterações de banco, migrações nem configuração de serviços de e-mail.
