import { KpiCard } from "@/components/KpiCard";
import { Shell } from "@/components/Shell";
import { catalog, diretorias, filiais } from "@/lib/data";
import { demoUsers } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

async function contarTabela(tabela: string, fallback: number) {
  if (!supabase) return fallback;
  const { count, error } = await supabase
    .from(tabela)
    .select("*", { count: "exact", head: true });
  return error ? fallback : count ?? fallback;
}

export default async function Cadastros() {
  const [usuariosQtd, filiaisQtd, diretoriasQtd, itensQtd, setoresQtd, projetosQtd] = await Promise.all([
    contarTabela("usuarios", demoUsers.length),
    contarTabela("filiais", filiais.length),
    contarTabela("diretorias", diretorias.length),
    contarTabela("itens_catalogo", catalog.itens.length),
    contarTabela("setores", catalog.setores.length),
    contarTabela("projetos", catalog.projetos.length),
  ]);

  return (
    <Shell
      title="Cadastros mestres"
      subtitle="Base de usuários, filiais, diretorias, setores, itens e projetos que alimenta o fluxo."
    >
      <section className="demo-note">
        Cadastros disponíveis somente para o perfil administrador. Os demais perfis enxergam apenas as telas do próprio fluxo.
      </section>

      <section className="kpi-grid">
        <KpiCard label="Usuários" value={String(usuariosQtd)} />
        <KpiCard label="Filiais" value={String(filiaisQtd)} variant="green" />
        <KpiCard label="Diretorias" value={String(diretoriasQtd)} variant="orange" />
        <KpiCard label="Itens catálogo" value={String(itensQtd)} variant="purple" />
      </section>

      <section className="panel">
        <h2>Regra de roteamento</h2>
        <div className="flow-row">
          <span>Solicitante</span><b>→</b><span>Filial</span><b>→</b><span>Diretoria</span><b>→</b><span>Fluxo de aprovação</span><b>→</b><span>Orçamento/Realização</span>
        </div>
        <p>
          Quando a filial cria uma solicitação, o sistema identifica a diretoria responsável e encaminha o item para as etapas corretas do fluxo.
        </p>
      </section>

      <section className="kpi-grid spaced">
        <KpiCard label="Setores" value={String(setoresQtd)} />
        <KpiCard label="Projetos padrão" value={String(projetosQtd)} variant="green" />
        <KpiCard label="Planos anuais" value="2026/2027" variant="orange" />
        <KpiCard label="Anexos permitidos" value="PDF/Imagem" variant="purple" />
      </section>
    </Shell>
  );
}
