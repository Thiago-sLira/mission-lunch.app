"use client";

import { useEffect, useState, useTransition } from "react";
import { Agendamento, DUPLAS_CONFIG, isDataDesabilitada } from "@/app/types/agendamento";
import { getAgendamentos } from "@/app/services/agendamentos";
import {
  formatarDataISO,
  formatarTituloDia,
  getDiasDoMes,
  MESES,
} from "@/app/utils/date";

interface VisualizarAlmocosProps {
  onVoltar?: () => void;
}

export default function VisualizarAlmocos({ onVoltar }: VisualizarAlmocosProps) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const mesSeguinte = mesAtual === 11 ? 0 : mesAtual + 1;
  const anoSeguinte = mesAtual === 11 ? anoAtual + 1 : anoAtual;

  const [ano, setAno] = useState(anoAtual);
  const [mes, setMes] = useState(mesAtual);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const isMesAtual = ano === anoAtual && mes === mesAtual;
  const isMesSeguinte = ano === anoSeguinte && mes === mesSeguinte;

  const handleMesAnterior = () => {
    if (isMesAtual) return;
    setAno(anoAtual);
    setMes(mesAtual);
  };

  const handleProximoMes = () => {
    if (isMesSeguinte) return;
    setAno(anoSeguinte);
    setMes(mesSeguinte);
  };

  const carregarDados = () => {
    setCarregando(true);
    setErro(null);
    getAgendamentos()
      .then((data) => {
        startTransition(() => {
          setAgendamentos(data);
          setCarregando(false);
        });
      })
      .catch((err) => {
        console.error(err);
        setErro("Não foi possível carregar a escala de almoços.");
        setCarregando(false);
      });
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Dias a exibir: no mês atual, apenas a partir de hoje; no mês seguinte, todos
  const hojeClean = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const diasDoMes = getDiasDoMes(ano, mes).filter((dia) => {
    if (isMesAtual) {
      const diaClean = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());
      return diaClean.getTime() >= hojeClean.getTime();
    }
    return true;
  });

  const mesNome = MESES[mes];

  return (
    <div className="flex flex-col min-h-screen bg-[#EEF2F7]">
      {/* Header com botão voltar */}
      <header
        className="w-full py-4 px-4 flex items-center justify-between sticky top-0 z-20 shadow-sm"
        style={{ backgroundColor: "#1B2A6B" }}
      >
        <button
          onClick={onVoltar}
          aria-label="Voltar"
          className="text-white hover:bg-white/10 p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer"
        >
          <svg
            className="w-6 h-6 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-white tracking-wide">
          Escala de Almoços
        </h1>
        <div className="w-10" />
      </header>

      {/* Conteúdo */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 flex flex-col gap-4">
        {/* Navegador de Mês */}
        <div className="bg-white rounded-2xl px-5 py-4 border border-gray-200/90 shadow-xs flex items-center justify-between">
          <button
            onClick={handleMesAnterior}
            disabled={isMesAtual}
            aria-label="Mês anterior"
            className={`p-2 rounded-lg transition-colors ${
              isMesAtual
                ? "text-gray-300 cursor-not-allowed opacity-40"
                : "text-gray-700 hover:bg-gray-100 cursor-pointer"
            }`}
          >
            <svg
              className="w-5 h-5 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <span className="text-lg font-bold text-gray-900 tracking-tight">
            {mesNome} {ano}
          </span>

          <button
            onClick={handleProximoMes}
            disabled={isMesSeguinte}
            aria-label="Próximo mês"
            className={`p-2 rounded-lg transition-colors ${
              isMesSeguinte
                ? "text-gray-300 cursor-not-allowed opacity-40"
                : "text-gray-700 hover:bg-gray-100 cursor-pointer"
            }`}
          >
            <svg
              className="w-5 h-5 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>

        {/* Loading state */}
        {carregando && (
          <div className="flex flex-col gap-3 py-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-5 border border-gray-200 animate-pulse flex flex-col gap-3 shadow-xs"
              >
                <div className="h-5 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-100 rounded w-full" />
                <div className="h-8 bg-gray-100 rounded w-full" />
                <div className="h-8 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Erro */}
        {erro && !carregando && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center flex flex-col gap-2">
            <p className="font-semibold text-sm">{erro}</p>
            <button
              onClick={carregarDados}
              className="text-xs font-bold underline text-red-800 cursor-pointer hover:opacity-80"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Lista de Dias */}
        {!carregando && !erro && (
          <div className="flex flex-col gap-3.5 pb-6">
            {diasDoMes.map((dia) => {
              const diaISO = formatarDataISO(dia);
              const { tag, diaSemana, diaEMes } = formatarTituloDia(dia, hoje);

              // Filtrar agendamentos desse dia na planilha
              const agendamentosDoDia = agendamentos.filter(
                (a) => a.data && a.data.startsWith(diaISO)
              );

              // Checar se todas as duplas do dia estão com data_desabilitada
              const duplasDesabilitadasDoDia = DUPLAS_CONFIG.filter((conf) => {
                const a = agendamentosDoDia.find((item) => item.dupla === conf.id);
                return a && isDataDesabilitada(a.data_desabilitada);
              });

              if (duplasDesabilitadasDoDia.length === DUPLAS_CONFIG.length) {
                return (
                  <div
                    key={diaISO}
                    className="bg-[#F8FAFC] border border-dashed border-gray-300 rounded-2xl p-4 flex flex-col gap-1.5 shadow-xs"
                  >
                    <div className="text-sm font-bold text-gray-700">
                      {tag && <span className="text-gray-500 mr-1">{tag} •</span>}
                      {diaSemana}, {diaEMes}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <span>🔒</span>
                      <span>Data indisponível — Sem escala</span>
                    </div>
                  </div>
                );
              }

              const isHoje = tag === "HOJE";

              return (
                <div
                  key={diaISO}
                  className={`bg-white rounded-2xl border ${
                    isHoje
                      ? "border-blue-300 shadow-md ring-1 ring-blue-100"
                      : "border-gray-200 shadow-xs"
                  } overflow-hidden`}
                >
                  {/* Cabeçalho do Card */}
                  <div
                    className={`px-4 py-2.5 font-bold text-sm ${
                      isHoje
                        ? "bg-blue-50/70 text-[#1B2A6B]"
                        : "bg-gray-50/70 text-gray-900"
                    }`}
                  >
                    {tag && <span className="text-[#1B2A6B] mr-1">{tag} •</span>}
                    <span>
                      {diaSemana}, {diaEMes}
                    </span>
                  </div>

                  {/* Lista de Duplas */}
                  <div className="p-4 flex flex-col gap-3">
                    {DUPLAS_CONFIG.map((config) => {
                      const agendamento = agendamentosDoDia.find(
                        (a) => a.dupla === config.id
                      );

                      const isDesabilitada = agendamento && isDataDesabilitada(agendamento.data_desabilitada);
                      const temAgendamento =
                        agendamento &&
                        !isDesabilitada &&
                        agendamento.nome_familia &&
                        agendamento.nome_familia.trim().length > 0;

                      return (
                        <div
                          key={config.id}
                          className="flex items-start gap-3 text-sm"
                        >
                          {/* Badge da Dupla */}
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 min-w-[76px] text-center ${
                              temAgendamento
                                ? `${config.badgeBg} ${config.badgeText}`
                                : isDesabilitada
                                ? "bg-gray-100 text-gray-600"
                                : "bg-red-100/70 text-red-700"
                            }`}
                          >
                            {config.shortLabel}
                          </span>

                          {/* Conteúdo / Status */}
                          <div className="flex-1 flex flex-col">
                            {temAgendamento ? (
                              <>
                                <span className="font-semibold text-gray-900 leading-snug">
                                  {agendamento.nome_familia}
                                </span>
                                {agendamento.observacao && (
                                  <span className="text-xs text-gray-500 mt-0.5">
                                    Obs: {agendamento.observacao}
                                  </span>
                                )}
                              </>
                            ) : isDesabilitada ? (
                              <span className="font-medium text-gray-500 leading-snug">
                                Sem escala
                              </span>
                            ) : (
                              <span className="font-medium text-red-500 leading-snug">
                                Sem almoço marcado
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
