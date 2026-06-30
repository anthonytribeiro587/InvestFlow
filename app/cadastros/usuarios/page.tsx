import { Shell } from "@/components/Shell";
import { demoUsers, normalizeRole, roleLabel } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

type UsuarioBanco = {
  id: string;
  nome: string | null;
  email: string | null;
  perfil: string | null;
  ativo: boolean | null;
  filial_id: string | null;
  diretoria_id: string | null;
};

type Filial = { id: string; nome_filial: string | null };
type Diretoria = { id: string; nome: string | null };

async function carregarUsuarios() {
  if (!supabase) return demoUsers;

  const [usuariosResp, filiaisResp, diretoriasResp] = await Promise.all([
    supabase.from("usuarios").select("id, nome, email, perfil, ativo, filial_id, diretoria_id").order("nome"),
    supabase.from("filiais").select("id, nome_filial"),
    supabase.from("diretorias").select("id, nome"),
  ]);

  if (usuariosResp.error || !usuariosResp.data?.length || usuariosResp.data.length < demoUsers.length) return demoUsers;

  const filiais = (filiaisResp.data ?? []) as Filial[];
  const diretorias = (diretoriasResp.data ?? []) as Diretoria[];

  return (usuariosResp.data as UsuarioBanco[]).map((usuario) => {
    const filial = filiais.find((item) => item.id === usuario.filial_id)?.nome_filial;
    const diretoria = diretorias.find((item) => item.id === usuario.diretoria_id)?.nome;
    const perfil = normalizeRole(usuario.perfil);

    return {
      nome: usuario.nome ?? "Usuário sem nome",
      email: usuario.email ?? "-",
      perfil,
      perfilLabel: roleLabel(perfil),
      vinculo: perfil === "admin" ? "Todas as áreas" : filial ?? diretoria ?? "Corporativo",
      status: usuario.ativo === false ? "Inativo" : "Ativo",
    };
  });
}

export default async function Usuarios() {
  const users = await carregarUsuarios();

  return (
    <Shell title="Usuários" subtitle="Cadastro de usuários, perfis e vínculos por fluxo.">
      <section className="panel">
        <div className="panel-top">
          <div>
            <h2>Usuários por fluxo</h2>
            <p>Perfis separados para demonstrar permissões e responsabilidades.</p>
          </div>
          <button className="action-button">Novo cadastro</button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Vínculo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email}>
                  <td>{user.nome}</td>
                  <td>{user.email}</td>
                  <td>{user.perfilLabel}</td>
                  <td>{user.vinculo}</td>
                  <td>{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}
