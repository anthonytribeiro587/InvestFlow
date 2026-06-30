# InvestFlow — apresentação

Esta versão usa Supabase Auth real. Não há entrada sem senha.

## Antes de apresentar

1. Configure na Vercel:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

2. Confirme os usuários em Authentication > Users.
3. Rode `supabase/CORRIGIR_PARA_APRESENTACAO_DIRETOR.sql`.
4. Entre com e-mail e senha reais.

## Fluxo recomendado para a demo

- Dashboard
- Solicitações
- Aprovação Diretoria
- Patrimônio
- Projetos
- Orçamentos/Cotações
- Realizações
- Relatórios


## Usuários Auth corretos

```text
admin@investflowdemo.com        -> admin / cadastros / visão geral
solicitante1@investflowdemo.com -> solicitante / criação de solicitações
diretor1@investflowdemo.com     -> diretoria / aprovação
patrimonio1@investflowdemo.com  -> patrimônio
projetos1@investflowdemo.com    -> projetos
compras1@investflowdemo.com     -> orçamentos, cotações e realizações
```
