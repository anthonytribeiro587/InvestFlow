# InvestFlow — demo segura

A demo está configurada para usar login real pelo Supabase Auth. O seletor de perfil e a entrada sem senha foram removidos.

## Usuários

Use os usuários criados em Authentication > Users. A tabela `public.usuarios` define o perfil e o vínculo de cada conta.

Perfis esperados:

```txt
admin@investflowdemo.com        -> admin / cadastros / visão geral
solicitante1@investflowdemo.com -> solicitante / criação de solicitações
diretor1@investflowdemo.com     -> diretoria / aprovação
patrimonio1@investflowdemo.com  -> patrimônio
projetos1@investflowdemo.com    -> projetos
compras1@investflowdemo.com     -> orçamentos, cotações e realizações
```

## Segurança

Esta versão valida `supabase.auth.getUser()` antes de liberar o Shell e remove o bypass demo. Para produção, implemente RLS por perfil e autenticação SSR.
