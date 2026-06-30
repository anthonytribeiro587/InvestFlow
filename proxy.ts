import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { canAccessPath, normalizeRole } from "./lib/auth";

const rotasProtegidas = [
  "/dashboard",
  "/solicitacoes",
  "/diretor",
  "/patrimonio",
  "/projetos",
  "/orcamentos",
  "/aprovacao-final",
  "/execucao",
  "/relatorios",
  "/cadastros",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rotaProtegida = rotasProtegidas.some((rota) =>
    pathname.startsWith(rota)
  );

  if (!rotaProtegida) {
    return NextResponse.next();
  }

  const temSessao = request.cookies.get("investflow-auth")?.value === "true";

  if (!temSessao) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const perfil = normalizeRole(request.cookies.get("investflow-role")?.value || "solicitante");

  if (!canAccessPath(perfil, pathname)) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/solicitacoes/:path*",
    "/diretor/:path*",
    "/patrimonio/:path*",
    "/projetos/:path*",
    "/orcamentos/:path*",
    "/aprovacao-final/:path*",
    "/execucao/:path*",
    "/relatorios/:path*",
    "/cadastros/:path*",
  ],
};
