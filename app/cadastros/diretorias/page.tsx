import { Shell } from "@/components/Shell";
import { diretorias as fallbackDiretorias } from "@/lib/data";
import { supabase } from "@/lib/supabase";

type DiretoriaBanco = { id: string; nome: string | null; supervisor_diretor: string | null; ativo: boolean | null };
type Filial = { id: string; diretoria_id: string | null };

async function carregarDiretorias() {
  if (!supabase) return fallbackDiretorias;

  const [diretoriasResp, filiaisResp] = await Promise.all([
    supabase.from("diretorias").select("id, nome, supervisor_diretor, ativo").order("nome"),
    supabase.from("filiais").select("id, diretoria_id").eq("ativo", true),
  ]);

  if (diretoriasResp.error || !diretoriasResp.data?.length) return fallbackDiretorias;

  const filiais = (filiaisResp.data ?? []) as Filial[];

  return (diretoriasResp.data as DiretoriaBanco[]).map((diretoria) => ({
    area: diretoria.nome ?? "-",
    diretor: diretoria.supervisor_diretor ?? "-",
    filiais: filiais.filter((filial) => filial.diretoria_id === diretoria.id).length,
    status: diretoria.ativo === false ? "Inativa" : "Ativa",
  }));
}

export default async function Diretorias() {
  const diretorias = await carregarDiretorias();

  return (
    <Shell title="Diretorias" subtitle="Áreas responsáveis pelo primeiro filtro de aprovação.">
      <section className="panel">
        <div className="panel-top">
          <div>
            <h2>Diretorias/Áreas</h2>
            <p>Filiais são vinculadas a uma diretoria e a um responsável.</p>
          </div>
          <button className="action-button">Nova diretoria</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Diretoria</th>
                <th>Responsável</th>
                <th>Filiais</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {diretorias.map((diretoria) => (
                <tr key={diretoria.area}>
                  <td>{diretoria.area}</td>
                  <td>{diretoria.diretor}</td>
                  <td>{diretoria.filiais}</td>
                  <td>{diretoria.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}
