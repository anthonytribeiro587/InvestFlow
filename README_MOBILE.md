# Ajuste mobile InvestFlow

Versão ajustada para apresentação em celular.

## O que mudou

- Sidebar do desktop fica oculta no mobile.
- Navegação mobile virou uma barra fixa inferior, estilo app/rede social.
- Conteúdo passa a ocupar 100% da tela no celular.
- Topo ficou compacto e fixo.
- Cards/KPIs foram ajustados para duas colunas no mobile.
- Modais viram tela cheia no celular, evitando corte de formulário.
- Tabelas viram cards no mobile, evitando scroll lateral quebrado.
- Formulários ficam em uma coluna no mobile.
- Mantido desktop como estava.

## Arquivos principais alterados

- `components/Shell.tsx`
- `app/globals.css`

## Importante

As variáveis reais do Supabase devem ficar apenas no Vercel, em Environment Variables.
Use `.env.example` apenas como modelo.
