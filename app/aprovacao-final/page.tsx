"use client";

import { useEffect, useMemo, useState } from "react";
import { KpiCard } from "@/components/KpiCard";
import { Shell } from "@/components/Shell";
import { supabase } from "@/lib/supabase";

type Solicitacao = {
  id: string;
  codigo: string | null;
  filial_id: string | null;
  setor_id: string | null;
  item_catalogo_id: string | null;
  status: string;

  prioridade: string | null;
  justificativa: string | null;
  observacao: string | null;
  observacao_diretoria: string | null;
  parecer_patrimonio: string | null;
  foto_url: string | null;

  projeto_orcamento: string | null;
  responsavel_orcamento: string | null;
  observacao_orcamento: string | null;

  fornecedor_orcamento: string | null;
  valor_orcado: number | null;
  prazo_orcamento: string | null;
  condicao_pagamento: string | null;
  observacao_cotacao: string | null;
};

type Filial = {
  id: string;
  nome_filial: string;
};

type Setor = {
  id: string;
  nome: string;
};

type ItemCatalogo = {
  id: string;
  nome_item: string;
};

export default function AprovacaoFinal() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [itens, setItens] = useState<ItemCatalogo[]>([]);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [detalheId, setDetalheId] = useState("");

  const detalhe = solicitacoes.find((s) => s.id === detalheId);

  async function carregarDados() {
    if (!supabase) return;

    const [solicitacoesResp, filiaisResp, setoresResp, itensResp] =
      await Promise.all([
        supabase
          .from("solicitacoes")
          .select(
            "id, codigo, filial_id, setor_id, item_catalogo_id, status, prioridade, justificativa, observacao, observacao_diretoria, parecer_patrimonio, foto_url, projeto_orcamento, responsavel_orcamento, observacao_orcamento, fornecedor_orcamento, valor_orcado, prazo_orcamento, condicao_pagamento, observacao_cotacao"
          )
          .eq("status", "orcamento_concluido")
          .order("codigo", { ascending: true }),

        supabase.from("filiais").select("id, nome_filial"),
        supabase.from("setores").select("id, nome"),
        supabase.from("itens_catalogo").select("id, nome_item"),
      ]);

    if (solicitacoesResp.error) {
      setMensagem(`Erro: ${solicitacoesResp.error.message}`);
      return;
    }

    setSolicitacoes((solicitacoesResp.data ?? []) as Solicitacao[]);
    setFiliais(filiaisResp.data ?? []);
    setSetores(setoresResp.data ?? []);
    setItens(itensResp.data ?? []);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function nomeFilial(id: string | null) {
    return filiais.find((f) => f.id === id)?.nome_filial ?? "-";
  }

  function nomeSetor(id: string | null) {
    return setores.find((s) => s.id === id)?.nome ?? "-";
  }

  function nomeItem(id: string | null) {
    return itens.find((i) => i.id === id)?.nome_item ?? "-";
  }

  function codigoCurto(codigo: string | null) {
    if (!codigo) return "-";

    const numeros = codigo.replace(/\D/g, "");
    const final = numeros.slice(-4);

    if (codigo.startsWith("SOL")) return `SOL-${final}`;
    if (codigo.startsWith("IMP")) return `IMP-${final}`;

    return `#${final}`;
  }

  function formatarMoeda(valor: number | null | undefined) {
    return Number(valor ?? 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function traduzStatus(status: string) {
    const mapa: Record<string, string> = {
      orcamento_concluido: "Orçado",
    };

    return mapa[status] ?? status;
  }

  function traduzPrioridade(valor: string | null) {
    const mapa: Record<string, string> = {
      baixa: "Baixa",
      media: "Média",
      alta: "Alta",
      critica: "Crítica",
    };

    if (!valor) return "-";

    return mapa[valor] ?? valor;
  }

  const solicitacoesFiltradas = useMemo(() => {
    if (!busca.trim()) return solicitacoes;

    const termo = busca.toLowerCase();

    return solicitacoes.filter((solicitacao) =>
      [
        solicitacao.codigo,
        nomeFilial(solicitacao.filial_id),
        nomeSetor(solicitacao.setor_id),
        nomeItem(solicitacao.item_catalogo_id),
        solicitacao.projeto_orcamento,
        solicitacao.responsavel_orcamento,
        solicitacao.fornecedor_orcamento,
      ]
        .join(" ")
        .toLowerCase()
        .includes(termo)
    );
  }, [busca, solicitacoes, filiais, setores, itens]);

  const valorTotal = solicitacoesFiltradas.reduce(
    (total, solicitacao) => total + Number(solicitacao.valor_orcado ?? 0),
    0
  );

  const totalItens = solicitacoesFiltradas.length;

  const totalFiliais = new Set(
    solicitacoesFiltradas.map((s) => s.filial_id).filter(Boolean)
  ).size;

  const totalFornecedores = new Set(
    solicitacoesFiltradas.map((s) => s.fornecedor_orcamento).filter(Boolean)
  ).size;

  return (
    <Shell
      title="Aprovação Final"
      subtitle="Consolidação dos investimentos orçados para envio ao conselho."
    >
      <section className="kpi-grid">
        <KpiCard
          label="Valor orçado"
          value={formatarMoeda(valorTotal)}
          variant="orange"
        />

        <KpiCard
          label="Itens orçados"
          value={String(totalItens)}
          variant="purple"
        />

        <KpiCard
          label="Filiais"
          value={String(totalFiliais)}
          variant="blue"
        />

        <KpiCard
          label="Fornecedores"
          value={String(totalFornecedores)}
          variant="green"
        />
      </section>

      {mensagem && <div className="alert-error">{mensagem}</div>}

      <section className="panel">
        <div className="panel-top">
          <div>
            <h2>Plano de investimentos</h2>
            <p>Resumo consolidado das solicitações orçadas.</p>
          </div>

          <button className="action-button" type="button">
            Exportar Excel
          </button>
        </div>

        <input
          className="search-input"
          placeholder="Buscar por código, filial, setor, projeto, responsável ou fornecedor..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <div className="request-table-limited diretoria-table">
          <table style={{ tableLayout: "fixed", width: "100%" }}>
            <colgroup>
              <col style={{ width: "110px" }} />
              <col style={{ width: "220px" }} />
              <col style={{ width: "180px" }} />
              <col style={{ width: "280px" }} />
              <col style={{ width: "160px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "130px" }} />
            </colgroup>

            <thead>
              <tr>
                <th>Código</th>
                <th>Filial</th>
                <th>Setor</th>
                <th>Projeto</th>
                <th>Fornecedor</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {solicitacoesFiltradas.map((solicitacao) => (
                <tr key={solicitacao.id}>
                  <td>{codigoCurto(solicitacao.codigo)}</td>

                  <td title={nomeFilial(solicitacao.filial_id)}>
                    {nomeFilial(solicitacao.filial_id)}
                  </td>

                  <td title={nomeSetor(solicitacao.setor_id)}>
                    {nomeSetor(solicitacao.setor_id)}
                  </td>

                  <td title={solicitacao.projeto_orcamento ?? ""}>
                    <strong>{solicitacao.projeto_orcamento ?? "-"}</strong>
                  </td>

                  <td>{solicitacao.fornecedor_orcamento ?? "-"}</td>

                  <td>{formatarMoeda(solicitacao.valor_orcado)}</td>

                  <td>
                    <span className={`status ${solicitacao.status}`}>
                      {traduzStatus(solicitacao.status)}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="mini-button"
                      onClick={() => setDetalheId(solicitacao.id)}
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}

              {solicitacoesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={8}>Nenhum investimento orçado encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {detalhe && (
        <div className="modal-backdrop">
          <section className="modal-card modal-card-wide">
            <div className="modal-header">
              <div>
                <h2>Detalhes do investimento</h2>
                <p>{detalhe.codigo}</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() => setDetalheId("")}
              >
                ×
              </button>
            </div>

            <div className="detail-grid">
              <div>
                <strong>Código</strong>
                <span>{codigoCurto(detalhe.codigo)}</span>
              </div>

              <div>
                <strong>Filial</strong>
                <span>{nomeFilial(detalhe.filial_id)}</span>
              </div>

              <div>
                <strong>Setor</strong>
                <span>{nomeSetor(detalhe.setor_id)}</span>
              </div>

              <div>
                <strong>Item</strong>
                <span>{nomeItem(detalhe.item_catalogo_id)}</span>
              </div>

              <div>
                <strong>Prioridade</strong>
                <span>{traduzPrioridade(detalhe.prioridade)}</span>
              </div>

              <div>
                <strong>Status</strong>
                <span>{traduzStatus(detalhe.status)}</span>
              </div>

              <div>
                <strong>Projeto</strong>
                <span>{detalhe.projeto_orcamento ?? "-"}</span>
              </div>

              <div>
                <strong>Responsável</strong>
                <span>{detalhe.responsavel_orcamento ?? "-"}</span>
              </div>

              <div>
                <strong>Fornecedor</strong>
                <span>{detalhe.fornecedor_orcamento ?? "-"}</span>
              </div>

              <div>
                <strong>Valor orçado</strong>
                <span>{formatarMoeda(detalhe.valor_orcado)}</span>
              </div>

              <div>
                <strong>Prazo</strong>
                <span>{detalhe.prazo_orcamento ?? "-"}</span>
              </div>

              <div>
                <strong>Condição de pagamento</strong>
                <span>{detalhe.condicao_pagamento ?? "-"}</span>
              </div>
            </div>

            <div className="detail-block">
              <strong>Justificativa da solicitação</strong>
              <p>{detalhe.justificativa || "Sem justificativa informada."}</p>
            </div>

            <div className="detail-block">
              <strong>Observação da solicitação</strong>
              <p>{detalhe.observacao || "Sem observação."}</p>
            </div>

            <div className="detail-block">
              <strong>Retorno da diretoria</strong>
              <p>
                {detalhe.observacao_diretoria ||
                  "Sem retorno da diretoria."}
              </p>
            </div>

            <div className="detail-block">
              <strong>Retorno do patrimônio</strong>
              <p>
                {detalhe.parecer_patrimonio ||
                  "Sem retorno do patrimônio."}
              </p>
            </div>

            <div className="detail-block">
              <strong>Observação do projeto</strong>
              <p>
                {detalhe.observacao_orcamento ||
                  "Sem observação do projeto."}
              </p>
            </div>

            <div className="detail-block">
              <strong>Observação da cotação</strong>
              <p>
                {detalhe.observacao_cotacao ||
                  "Sem observação da cotação."}
              </p>
            </div>

            <div className="detail-block">
              <strong>Foto da necessidade</strong>

              {detalhe.foto_url ? (
                <a
                  href={detalhe.foto_url}
                  target="_blank"
                  rel="noreferrer"
                  className="request-photo-link"
                >
                  <img
                    src={detalhe.foto_url}
                    alt="Foto da necessidade"
                    className="request-photo"
                  />
                </a>
              ) : (
                <p>Nenhuma foto anexada.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </Shell>
  );
}