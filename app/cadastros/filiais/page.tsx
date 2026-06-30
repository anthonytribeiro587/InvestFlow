import { Shell } from "@/components/Shell";
import { filiais as fallbackFiliais } from "@/lib/data";
import { supabase } from "@/lib/supabase";

type FilialBanco = {
  id: string;
  codigo_filial: string | null;
  nome_filial: string | null;
  cidade: string | null;
  area: string | null;
  gerente_nome: string | null;
  diretor_responsavel: string | null;
  diretoria_id: string | null;
};

type Diretoria = { id: string; nome: string | null; supervisor_diretor: string | null };

async function carregarFiliais() {
  if (!supabase) return fallbackFiliais;

  const [filiaisResp, diretoriasResp] = await Promise.all([
    supabase.from("filiais").select("id, codigo_filial, nome_filial, cidade, area, gerente_nome, diretor_responsavel, diretoria_id").eq("ativo", true).order("codigo_filial"),
    supabase.from("diretorias").select("id, nome, supervisor_diretor"),
  ]);

  if (filiaisResp.error || !filiaisResp.data?.length) return fallbackFiliais;

  const diretorias = (diretoriasResp.data ?? []) as Diretoria[];

  return (filiaisResp.data as FilialBanco[]).map((filial) => {
    const diretoria = diretorias.find((item) => item.id === filial.diretoria_id);
    return {
      codigo: filial.codigo_filial ?? "-",
      filial: filial.nome_filial ?? "-",
      area: diretoria?.nome ?? filial.area ?? "-",
      diretor: filial.diretor_responsavel ?? diretoria?.supervisor_diretor ?? "-",
      gerente: filial.gerente_nome ?? "-",
      cidade: filial.cidade ?? "-",
    };
  });
}

export default async function Filiais() {
  const filiais = await carregarFiliais();

  return (
    <Shell title="Filiais" subtitle="Cadastro de filiais, diretoria, gerente e responsável.">
      <section className="panel">
        <div className="panel-top">
          <div>
            <h2>Filiais</h2>
            <p>Base para roteamento automático das solicitações.</p>
          </div>
          <button className="action-button">Nova filial</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Filial</th>
                <th>Diretoria</th>
                <th>Diretor</th>
                <th>Gerente</th>
                <th>Cidade</th>
              </tr>
            </thead>
            <tbody>
              {filiais.map((filial) => (
                <tr key={filial.codigo}>
                  <td>{filial.codigo}</td>
                  <td>{filial.filial}</td>
                  <td>{filial.area}</td>
                  <td>{filial.diretor}</td>
                  <td>{filial.gerente}</td>
                  <td>{filial.cidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}
