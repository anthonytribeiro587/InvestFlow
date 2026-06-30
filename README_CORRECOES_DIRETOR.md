# InvestFlow — pacote corrigido para apresentação ao diretor

Versão focada em estabilidade de apresentação e login real pelo Supabase Auth.

## O que foi corrigido

- Nova solicitação não envia mais `id` nulo.
- Erros de formulário aparecem dentro do modal, não atrás da tela.
- Menu de Cadastros não marca duas abas ao mesmo tempo.
- Cadastros aparecem somente para o perfil `admin`.
- Foram criados perfis separados por fluxo:
  - Admin
  - Solicitante
  - Diretoria
  - Patrimônio
  - Projetos
  - Orçamentos
  - Realizações
- Relatórios foram separados por visão:
  - Geral
  - Solicitante
  - Diretoria
  - Patrimônio
  - Projetos
  - Orçamentos e realizações
- Exportação CSV ajustada com UTF-8 BOM para abrir melhor no Excel em português.
- Tela de Realizações criada para lançar valor realizado.
- `.env.local` removido do pacote; use `.env.example`.
- Dependências atualizadas e build validado.

## Alteração importante de login

Não existe mais login sem senha.

A tela de login agora usa somente:

```txt
Supabase Auth -> signInWithPassword
```

Ou seja: o usuário precisa existir em **Authentication > Users** no Supabase e precisa informar a senha correta.

## Usuários esperados

Os usuários do Supabase Auth correto são reconhecidos:

```txt
admin@investflowdemo.com        -> admin / cadastros / visão geral
solicitante1@investflowdemo.com -> solicitante / criação de solicitações
diretor1@investflowdemo.com     -> diretoria / aprovação
patrimonio1@investflowdemo.com  -> patrimônio
projetos1@investflowdemo.com    -> projetos
compras1@investflowdemo.com     -> orçamentos, cotações e realizações
```

Como esses usuários já existem no Supabase Auth, rode o SQL abaixo para vincular `public.usuarios.auth_user_id` aos usuários reais:

```txt
supabase/CORRIGIR_PARA_APRESENTACAO_DIRETOR.sql
```

## Ordem antes de apresentar

1. Subir o ZIP no GitHub/Vercel.
2. Confirmar variáveis na Vercel:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

3. Rodar o SQL no Supabase.
4. Fazer logout.
5. Entrar com o usuário real e senha.
6. Testar o fluxo principal:
   - Solicitação
   - Diretoria
   - Patrimônio
   - Projetos
   - Orçamentos
   - Realizações
   - Relatórios

## Observação sobre segurança

Esta versão remove o bypass de demonstração sem senha e valida a sessão ativa do Supabase no front-end antes de liberar o Shell.

Para produção real, a próxima etapa é endurecer a segurança com Supabase RLS por perfil e SSR Auth, para que a proteção não dependa apenas de menu/rota.
