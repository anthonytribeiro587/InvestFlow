import { Shell } from "@/components/Shell";
import { catalog as fallbackCatalog } from "@/lib/data";
import { supabase } from "@/lib/supabase";

async function carregarCatalogo() {
  if (!supabase) return fallbackCatalog;

  const [setoresResp, projetosResp, itensResp] = await Promise.all([
    supabase.from("setores").select("nome").eq("ativo", true).order("nome"),
    supabase.from("projetos").select("nome_projeto").eq("ativo", true).order("nome_projeto"),
    supabase.from("itens_catalogo").select("nome_item").eq("ativo", true).order("nome_item"),
  ]);

  return {
    setores: setoresResp.error || !setoresResp.data?.length ? fallbackCatalog.setores : setoresResp.data.map((item) => item.nome ?? "-"),
    projetos: projetosResp.error || !projetosResp.data?.length ? fallbackCatalog.projetos : projetosResp.data.map((item) => item.nome_projeto ?? "-"),
    itens: itensResp.error || !itensResp.data?.length ? fallbackCatalog.itens : itensResp.data.map((item) => item.nome_item ?? "-"),
  };
}

export default async function Catalogo() {
  const catalog = await carregarCatalogo();

  return (
    <Shell title="Catálogo de investimentos" subtitle="Setores, itens e projetos para padronizar a solicitação.">
      <div className="two-col">
        <section className="panel">
          <h2>Setores</h2>
          {catalog.setores.map((setor) => (
            <div className="list-item" key={setor}>
              <span>{setor}</span><strong>Ativo</strong>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Projetos padrão</h2>
          {catalog.projetos.map((projeto) => (
            <div className="list-item" key={projeto}>
              <span>{projeto}</span><strong>Ativo</strong>
            </div>
          ))}
        </section>
      </div>

      <section className="panel spaced">
        <h2>Itens de catálogo</h2>
        <div className="chip-row">
          {catalog.itens.map((item) => (
            <span className="chip" key={item}>{item}</span>
          ))}
        </div>
      </section>
    </Shell>
  );
}
