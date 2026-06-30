"use client";

import { useEffect, useMemo, useState } from "react";
import { DetailInfoGrid } from "@/components/DetailInfoGrid";
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
  fornecedor_orcamento: string | null;
  valor_orcado: number | null;
  valor_realizado?: number | null;
  data_realizacao?: string | null;
  observacao_realizacao?: string | null;
  created_at: string;
};

type Filial = { id: string; nome_filial: string };
type Setor = { id: string; nome: string };
type ItemCatalogo = { id: string; nome_item: string };

function moeda(valor: number | null | undefined) {
  return Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

function valorParaNumero(valorTexto: string) {
  const limpo = valorTexto
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".");
  const numero = Number(limpo);
  return Number.isNaN(numero) ? 0 : numero;
}

export default function Execucao() {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [itens, setItens] = useState<ItemCatalogo[]>([]);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [detalheId, setDetalheId] = useState("");
  const [valorRealizado, setValorRealizado] = useState("");
  const [observacao, setObservacao] = useState("");

  async function carregarDados() {
    if (!supabase) return;

    const [solicitacoesResp, filiaisResp, setoresResp, itensResp] = await Promise.all([
      supabase
        .from("solicitacoes")
        .select("*")
        .in("status", ["orcamento_concluido", "realizado"])
        .order("created_at", { ascending: false })
        .limit(80),
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
    return filiais.find((item) => item.id === id)?.nome_filial ?? "-";
  }

  function nomeSetor(id: string | null) {
    return setores.find((item) => item.id === id)?.nome ?? "-";
  }

  function nomeItem(id: string | null) {
    return itens.find((item) => item.id === id)?.nome_item ?? "-";
  }

  function abrirDetalhes(solicitacao: Solicitacao) {
    setDetalheId(solicitacao.id);
    setValorRealizado(solicitacao.valor_realizado ? String(solicitacao.valor_realizado).replace(".", ",") : "");
    setObservacao(solicitacao.observacao_realizacao ?? "");
    setMensagem("");
  }

  const detalhe = solicitacoes.find((item) => item.id === detalheId);

  const filtradas = useMemo(() => {
    if (!busca.trim()) return solicitacoes;
    const termo = busca.toLowerCase();
    return solicitacoes.filter((item) =>
      [item.codigo, nomeFilial(item.filial_id), nomeSetor(item.setor_id), nomeItem(item.item_catalogo_id), item.fornecedor_orcamento]
        .join(" ")
        .toLowerCase()
        .includes(termo)
    );
  }, [solicitacoes, busca, filiais, setores, itens]);

  const pendentes = solicitacoes.filter((item) => item.status === "orcamento_concluido");
  const realizados = solicitacoes.filter((item) => item.status === "realizado");
  const totalOrcado = solicitacoes.reduce((acc, item) => acc + Number(item.valor_orcado || 0), 0);
  const totalRealizado = solicitacoes.reduce((acc, item) => acc + Number(item.valor_realizado || 0), 0);

  async function salvarRealizacao() {
    if (!supabase || !detalhe) return;

    const valor = valorParaNumero(valorRealizado);

    if (valor <= 0) {
      setMensagem("Erro: informe um valor realizado válido.");
      return;
    }

    setLoading(true);
    setMensagem("");

    const { error } = await supabase
      .from("solicitacoes")
      .update({
        status: "realizado",
        valor_realizado: valor,
        data_realizacao: new Date().toISOString(),
        observacao_realizacao: observacao,
      })
      .eq("id", detalhe.id);

    setLoading(false);

    if (error) {
      setMensagem(`Erro: ${error.message}`);
      return;
    }

    setMensagem("Realização registrada com sucesso.");
    setDetalheId("");
    await carregarDados();
  }

  return (
    <Shell
      title="Realizações"
      subtitle="Acompanhamento dos itens orçados até o valor realizado."
    >
      <section className="kpi-grid">
        <KpiCard label="Pendentes realização" value={String(pendentes.length)} variant="orange" />
        <KpiCard label="Realizados" value={String(realizados.length)} variant="green" />
        <KpiCard label="Valor orçado" value={moeda(totalOrcado)} variant="blue" />
        <KpiCard label="Valor realizado" value={moeda(totalRealizado)} variant="purple" />
      </section>

      {mensagem && !detalhe && (
        <div className={mensagem.startsWith("Erro") ? "alert-error" : "alert-success"}>{mensagem}</div>
      )}

      <section className="panel">
        <div className="panel-top">
          <div>
            <h2>Orçamentos para realização</h2>
            <p>Itens com orçamento concluído podem receber valor realizado e observação de execução.</p>
          </div>
        </div>

        <div className="form-grid compact">
          <label>
            Buscar
            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Código, unidade, setor, item ou fornecedor" />
          </label>
        </div>

        <div className="request-table-limited orcamentos-table">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Unidade</th>
                <th>Item</th>
                <th>Fornecedor</th>
                <th>Orçado</th>
                <th>Realizado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((item) => (
                <tr key={item.id}>
                  <td>{item.codigo ?? "-"}</td>
                  <td>{nomeFilial(item.filial_id)}</td>
                  <td><strong>{nomeItem(item.item_catalogo_id)}</strong></td>
                  <td>{item.fornecedor_orcamento ?? "-"}</td>
                  <td>{moeda(item.valor_orcado)}</td>
                  <td><span className={`status ${item.status}`}>{item.status === "realizado" ? moeda(item.valor_realizado) : "Pendente"}</span></td>
                  <td><button className="mini-button approve" type="button" onClick={() => abrirDetalhes(item)}>Registrar</button></td>
                </tr>
              ))}

              {filtradas.length === 0 && (
                <tr><td colSpan={7}>Nenhum item disponível para realização.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {detalhe && (
        <div className="modal-backdrop">
          <section className="modal-card">
            <div className="modal-header">
              <div>
                <h2>Registrar realização</h2>
                <p>{detalhe.codigo}</p>
              </div>
              <button type="button" className="modal-close" onClick={() => setDetalheId("")}>×</button>
            </div>

            {mensagem && (
              <div className={mensagem.startsWith("Erro") ? "alert-error" : "alert-success"}>{mensagem}</div>
            )}

            <DetailInfoGrid
              items={[
                { label: "Unidade", value: nomeFilial(detalhe.filial_id) },
                { label: "Setor", value: nomeSetor(detalhe.setor_id) },
                { label: "Item", value: nomeItem(detalhe.item_catalogo_id) },
                { label: "Fornecedor", value: detalhe.fornecedor_orcamento ?? "-" },
                { label: "Valor orçado", value: moeda(detalhe.valor_orcado) },
                { label: "Status", value: detalhe.status === "realizado" ? "Realizado" : "Pendente" },
              ]}
            />

            <label>
              Valor realizado
              <input value={valorRealizado} onChange={(e) => setValorRealizado(e.target.value)} placeholder="Ex.: 58.320,00" />
            </label>

            <label>
              Observação da realização
              <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Pedido SAP, NF, data prevista/concluída ou observação de execução..." />
            </label>

            <div className="modal-footer-actions">
              <button type="button" className="action-main approve" onClick={salvarRealizacao} disabled={loading}>
                {loading ? "Salvando..." : "Salvar realização"}
              </button>
            </div>
          </section>
        </div>
      )}
    </Shell>
  );
}
