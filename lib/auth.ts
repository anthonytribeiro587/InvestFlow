export type UserRole =
  | "admin"
  | "solicitante"
  | "diretoria"
  | "patrimonio"
  | "projetos"
  | "orcamentos"
  | "realizacoes";

export type DemoUser = {
  nome: string;
  email: string;
  perfil: UserRole;
  perfilLabel: string;
  vinculo: string;
  status: string;
};

export const demoUsers: DemoUser[] = [
  {
    nome: "Anthony Ribeiro",
    email: "admin@investflowdemo.com",
    perfil: "admin",
    perfilLabel: "Administrador",
    vinculo: "Todas as áreas",
    status: "Ativo",
  },
  {
    nome: "Solicitante 01",
    email: "solicitante1@investflowdemo.com",
    perfil: "solicitante",
    perfilLabel: "Solicitante",
    vinculo: "Unidade 01 — Centro",
    status: "Ativo",
  },
  {
    nome: "Diretor 01",
    email: "diretor1@investflowdemo.com",
    perfil: "diretoria",
    perfilLabel: "Diretoria",
    vinculo: "Diretoria Operacional",
    status: "Ativo",
  },
  {
    nome: "Patrimônio 01",
    email: "patrimonio1@investflowdemo.com",
    perfil: "patrimonio",
    perfilLabel: "Patrimônio",
    vinculo: "Corporativo",
    status: "Ativo",
  },
  {
    nome: "Projetos 01",
    email: "projetos1@investflowdemo.com",
    perfil: "projetos",
    perfilLabel: "Projetos",
    vinculo: "Corporativo",
    status: "Ativo",
  },
  {
    nome: "Compras/Realizações 01",
    email: "compras1@investflowdemo.com",
    perfil: "orcamentos",
    perfilLabel: "Orçamentos e Realizações",
    vinculo: "Compras/Orçamentos/Execução",
    status: "Ativo",
  },
];

const emailRoleAliases: Record<string, UserRole> = {
  "admin@investflowdemo.com": "admin",
  "admin@investflow.com": "admin",
  "admin@empresa.com": "admin",

  "solicitante1@investflowdemo.com": "solicitante",
  "gerente01@investflowdemo.com": "solicitante",
  "gerente01@investflow.com": "solicitante",
  "gerente01@empresa.com": "solicitante",
  "solicitante@investflow.com": "solicitante",
  "solicitante@investflowdemo.com": "solicitante",

  "diretor1@investflowdemo.com": "diretoria",
  "diretor01@investflowdemo.com": "diretoria",
  "diretor@investflow.com": "diretoria",
  "diretor.a@empresa.com": "diretoria",
  "diretoria@investflow.com": "diretoria",
  "diretoria@investflowdemo.com": "diretoria",

  "patrimonio1@investflowdemo.com": "patrimonio",
  "patrimonio@investflowdemo.com": "patrimonio",
  "patrimonio@investflow.com": "patrimonio",
  "patrimonio@empresa.com": "patrimonio",

  "projetos1@investflowdemo.com": "projetos",
  "projetos@investflowdemo.com": "projetos",
  "projetos@investflow.com": "projetos",

  "compras1@investflowdemo.com": "orcamentos",
  "compras@investflowdemo.com": "orcamentos",
  "orcamento@empresa.com": "orcamentos",
  "orcamentos@investflow.com": "orcamentos",
  "orcamentos@investflowdemo.com": "orcamentos",

  "realizacoes@investflow.com": "realizacoes",
  "realizacoes@investflowdemo.com": "realizacoes",
};

export function normalizeRole(role?: string | null): UserRole {
  const valor = String(role ?? "").toLowerCase().trim();

  if (["admin", "administrador"].includes(valor)) return "admin";
  if (["solicitante", "gerente", "gerente_loja", "loja"].includes(valor)) return "solicitante";
  if (["diretoria", "diretor"].includes(valor)) return "diretoria";
  if (["patrimonio", "patrimônio"].includes(valor)) return "patrimonio";
  if (["projetos", "projeto"].includes(valor)) return "projetos";
  if (["orcamentos", "orçamentos", "orcamento", "orçamento", "orcamento_compras", "compras"].includes(valor)) return "orcamentos";
  if (["realizacoes", "realizações", "realizacao", "realização", "execucao", "execução"].includes(valor)) return "realizacoes";

  return "solicitante";
}

export function roleLabel(role?: string | null) {
  const mapa: Record<UserRole, string> = {
    admin: "Administrador",
    solicitante: "Solicitante",
    diretoria: "Diretoria",
    patrimonio: "Patrimônio",
    projetos: "Projetos",
    orcamentos: "Orçamentos/Cotações",
    realizacoes: "Realizações",
  };

  return mapa[normalizeRole(role)];
}

export function knownRoleFromEmail(email?: string | null): UserRole | null {
  const normalizado = String(email ?? "").toLowerCase().trim();
  return emailRoleAliases[normalizado] ?? null;
}

export function roleFromEmail(email?: string | null): UserRole {
  return knownRoleFromEmail(email) ?? "solicitante";
}

export function getDemoUserByEmail(email?: string | null) {
  const normalizado = String(email ?? "").toLowerCase().trim();
  const user = demoUsers.find((item) => item.email.toLowerCase() === normalizado);

  if (user) return user;

  const perfil = knownRoleFromEmail(normalizado);
  if (!perfil) return null;

  return {
    nome: roleLabel(perfil),
    email: normalizado,
    perfil,
    perfilLabel: roleLabel(perfil),
    vinculo: perfil === "admin" ? "Todas as áreas" : "Fluxo operacional",
    status: "Ativo",
  } satisfies DemoUser;
}

type UsuarioPerfilRow = {
  nome: string | null;
  email: string | null;
  perfil: string | null;
  ativo: boolean | null;
};

async function buscarPerfilPorCampo(
  supabaseClient: any,
  campo: "auth_user_id" | "email",
  valor: string
): Promise<UsuarioPerfilRow | null> {
  const { data, error } = await supabaseClient
    .from("usuarios")
    .select("nome, email, perfil, ativo")
    .eq(campo, valor)
    .limit(1);

  if (error || !Array.isArray(data) || data.length === 0) return null;
  return data[0] as UsuarioPerfilRow;
}

export async function getProfileForAuthUser(
  supabaseClient: any,
  authUser: { id?: string; email?: string | null }
) {
  const email = String(authUser.email ?? "").toLowerCase().trim();
  let perfilBanco: UsuarioPerfilRow | null = null;

  if (authUser.id) {
    perfilBanco = await buscarPerfilPorCampo(supabaseClient, "auth_user_id", authUser.id);
  }

  if (!perfilBanco && email) {
    perfilBanco = await buscarPerfilPorCampo(supabaseClient, "email", email);
  }

  if (perfilBanco?.ativo === false) {
    return null;
  }

  const perfilConhecido = perfilBanco?.perfil ? normalizeRole(perfilBanco.perfil) : knownRoleFromEmail(email);

  if (!perfilConhecido) {
    return null;
  }

  return {
    nome: perfilBanco?.nome || email || roleLabel(perfilConhecido),
    email: perfilBanco?.email || email,
    perfil: perfilConhecido,
  };
}

const allowedPrefixes: Record<UserRole, string[]> = {
  admin: ["/dashboard", "/solicitacoes", "/diretor", "/patrimonio", "/projetos", "/orcamentos", "/execucao", "/relatorios", "/aprovacao-final", "/cadastros"],
  solicitante: ["/dashboard", "/solicitacoes", "/relatorios"],
  diretoria: ["/dashboard", "/diretor", "/relatorios"],
  patrimonio: ["/dashboard", "/patrimonio", "/relatorios"],
  projetos: ["/dashboard", "/projetos", "/relatorios"],
  orcamentos: ["/dashboard", "/orcamentos", "/execucao", "/relatorios"],
  realizacoes: ["/dashboard", "/execucao", "/relatorios"],
};

export function canAccessPath(role: UserRole | string | null | undefined, pathname: string) {
  const perfil = normalizeRole(role);
  const permitidas = allowedPrefixes[perfil] ?? allowedPrefixes.solicitante;
  return permitidas.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));
}

export function defaultReportForRole(role: UserRole | string | null | undefined) {
  const perfil = normalizeRole(role);
  if (perfil === "admin") return "geral";
  if (perfil === "solicitante") return "solicitante";
  if (perfil === "diretoria") return "diretoria";
  if (perfil === "patrimonio") return "patrimonio";
  if (perfil === "projetos") return "projetos";
  return "orcamentos_realizacoes";
}
