# InvestFlow Demo - apresentação segura

Esta versão foi preparada para demonstração interna com dados fictícios.

## O que foi alterado

- Dashboard agora usa o status real das solicitações da base demo.
- A base de apresentação foi reduzida para 24 solicitações fictícias.
- Foram criados registros nas etapas:
  - Solicitações
  - Aprovação Diretoria
  - Patrimônio
  - Projetos
  - Orçamentos/Cotações
- Projetos e responsáveis foram trocados por nomes genéricos.
- O menu de execução/SAP permanece como evolução futura.
- `.env.local` não está no ZIP. Use `.env.example` como referência.

## SQL para rodar no Supabase demo

Depois de publicar esta versão ou antes de testar, rode no projeto Supabase demo:

`supabase/COPIAR_NO_SUPABASE_fluxo_demo.txt`

Esse script limpa a base demo grande e recria uma amostra fictícia de 24 itens.

Não rode no banco real.

## Variáveis no Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=URL_DO_SUPABASE_DEMO
NEXT_PUBLIC_SUPABASE_ANON_KEY=ANON_KEY_DO_SUPABASE_DEMO
NEXT_PUBLIC_DEMO_MODE=true
```

## Observação de segurança

Esta versão está adequada para demonstração com dados fictícios. Para produção real, ainda é recomendado implementar autenticação SSR com validação de sessão no servidor e políticas RLS completas no Supabase.
