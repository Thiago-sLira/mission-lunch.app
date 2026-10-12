"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import {
  Agendamento,
  Dupla,
  Missionario,
  DuplaInfo,
  agruparDuplas,
} from "@/app/types/agendamento";
import DuplaPill from "@/app/components/DuplaPill";
import LogoutButton from "@/app/components/LogoutButton";
import { useAdmin } from "@/app/context/AdminContext";
import { excluirAgendamento, getAgendamentos } from "@/app/services/agendamentos";
import { ApiActionError, getMissionarios } from "@/app/services/missionarios";
import {
  formatarDataISO,
  formatarTituloDia,
  getDiasDoMes,
  MESES,
} from "@/app/utils/date";
import FormularioBloqueio from "./FormularioBloqueio";

interface BloquearDatasProps {
  onVoltar?: () => void;
}

export default function BloquearDatas({ onVoltar }: BloquearDatasProps) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const mesSeguinte = mesAtual === 11 ? 0 : mesAtual + 1;
  const anoSeguinte = mesAtual === 11 ? anoAtual + 1 : anoAtual;

  const [ano, setAno] = useState(anoAtual);
  const [mes, setMes] = useState(mesAtual);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [missionarios, setMissionarios] = useState<Missionario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);
  const [duplasDisponiveisParaDia, setDuplasDisponiveisParaDia] = useState<Dupla[]>([]);

  // Liberação de data: chave "YYYY-MM-DD-DUPLA" em andamento e erro por chave
  const [liberando, setLiberando] = useState<string | null>(null);
  const [erroLiberar, setErroLiberar] = useState<{ chave: string; mensagem: string } | null>(null);
  const { marcarSessaoExpirada } = useAdmin();

  const [, startTransition] = useTransition();

  const duplas: DuplaInfo[] = useMemo(() => agruparDuplas(missionarios), [missionarios]);

  const carregarDados = () => {
    setCarregando(true);
    setErro(null);
    return Promise.all([getAgendamentos(), getMissionarios()])
      .then(([agendamentosData, missionariosData]) => {
        startTransition(() => {
          setAgendamentos(agendamentosData);
          setMissionarios(missionariosData);
          setCarregando(false);
        });
      })
      .catch((err) => {
        console.error(err);
        setErro("Não foi possível carregar a disponibilidade dos dias.");
        setCarregando(false);
      });
  };

  useEffect(() => {
    (async () => {
      await carregarDados();
    })();
  }, []);

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

  const hojeClean = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const diasDoMes = getDiasDoMes(ano, mes).filter((dia) => {
    if (isMesAtual) {
      const diaClean = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());
      return diaClean.getTime() >= hojeClean.getTime();
    }
    return true;
  });
  const mesNome = MESES[mes];

  const handleAbrirBloqueio = (dia: Date, livres: Dupla[]) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setDiaSelecionado(dia);
    setDuplasDisponiveisParaDia(livres);
  };

  const handleSucessoBloqueio = () => {
    setDiaSelecionado(null);
    carregarDados();
  };

  const handleConflitoBloqueio = () => {
    setDiaSelecionado(null);
    carregarDados();
  };

  const handleLiberarData = async (diaISO: string, dupla: Dupla) => {
    const chave = `${diaISO}-${dupla}`;
    if (liberando) return;
    setLiberando(chave);
    setErroLiberar(null);
    try {
      await excluirAgendamento(diaISO, dupla);
      await carregarDados();
    } catch (err) {
      console.error(err);
      if (err instanceof ApiActionError && err.code === "UNAUTHORIZED") {
        marcarSessaoExpirada();
      }
      setErroLiberar({
        chave,
        mensagem:
          err instanceof ApiActionError
            ? err.message
            : "Não foi possível liberar a data. Tente novamente.",
      });
    } finally {
      setLiberando(null);
    }
  };

  if (diaSelecionado) {
    return (
      <FormularioBloqueio
        data={diaSelecionado}
        duplasDisponiveis={duplasDisponiveisParaDia}
        duplas={duplas}
        onVoltar={() => setDiaSelecionado(null)}
        onSucesso={handleSucessoBloqueio}
        onConflito={handleConflitoBloqueio}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#EEF2F7]">
      {/* Header */}
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
          🚫 Editar Datas
        </h1>
        <LogoutButton onSair={onVoltar} />
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 flex flex-col gap-4">
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

        {/* Subtítulo */}
        <div className="pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            DIAS DO MÊS
          </span>
        </div>

        {/* Loading state */}
        {carregando && (
          <div className="flex flex-col gap-3 py-2">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-5 border border-gray-200 animate-pulse flex flex-col gap-3 shadow-xs"
              >
                <div className="h-5 bg-gray-200 rounded w-2/3" />
                <div className="h-6 bg-gray-100 rounded w-1/2" />
                <div className="h-10 bg-gray-200 rounded w-full" />
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
          <div className="flex flex-col gap-3.5 pb-8">
            {diasDoMes.map((dia) => {
              const diaISO = formatarDataISO(dia);
              const { diaSemana, diaEMes } = formatarTituloDia(dia);

              const registrosDoDia = agendamentos.filter(
                (a) => a.data && a.data.startsWith(diaISO)
              );

              // Qualquer registro existente (agendado ou bloqueado) = indisponível
              const duplasLivres: Dupla[] = duplas
                .filter((conf) => !registrosDoDia.some((a) => a.dupla === conf.id))
                .map((conf) => conf.id);

              const todasOcupadas = duplas.length > 0 && duplasLivres.length === 0;

              return (
                <div
                  key={diaISO}
                  className="bg-white rounded-2xl border border-gray-200 p-4.5 flex flex-col gap-3.5 shadow-xs transition-shadow hover:shadow-sm"
                >
                  {/* Título do Dia */}
                  <div className="text-base font-bold text-gray-900">
                    {diaSemana}, {diaEMes}
                  </div>

                  {/* Pills com os nomes das duplas + ação "Liberar Data" nas ocupadas */}
                  <div className="flex flex-col gap-2">
                    {duplas.map((conf) => {
                      const livre = duplasLivres.includes(conf.id);
                      const chave = `${diaISO}-${conf.id}`;
                      const isLiberando = liberando === chave;

                      return (
                        <div key={conf.id} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <DuplaPill texto={conf.nomesExibicao} livre={livre} />
                            {!livre && (
                              <button
                                type="button"
                                onClick={() => handleLiberarData(diaISO, conf.id)}
                                disabled={liberando !== null}
                                aria-label={`Liberar data para ${conf.nomesExibicao}`}
                                className="shrink-0 flex items-center gap-1 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isLiberando ? (
                                  <span className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                    />
                                  </svg>
                                )}
                                <span>{isLiberando ? "Liberando..." : "Liberar Data"}</span>
                              </button>
                            )}
                          </div>
                          {erroLiberar?.chave === chave && (
                            <p role="alert" className="text-xs text-red-600">
                              {erroLiberar.mensagem}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Botão de Bloqueio */}
                  {todasOcupadas ? (
                    <button
                      disabled
                      className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm cursor-not-allowed"
                    >
                      Todas as duplas já estão ocupadas
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAbrirBloqueio(dia, duplasLivres)}
                      className="w-full py-3 bg-[#1B2A6B] hover:bg-[#152154] text-white rounded-xl font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      Bloquear agendamento para esse dia
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
