"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Agendamento,
  DUPLAS_CONFIG,
  Dupla,
  isDataDesabilitada,
} from "@/app/types/agendamento";
import { getAgendamentos } from "@/app/services/agendamentos";
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
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);
  const [duplasDisponiveisParaDia, setDuplasDisponiveisParaDia] = useState<Dupla[]>([]);
  const [duplasOcupadasParaDia, setDuplasOcupadasParaDia] = useState<Dupla[]>([]);

  const [, startTransition] = useTransition();

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
        setErro("Não foi possível carregar a disponibilidade dos dias.");
        setCarregando(false);
      });
  };

  useEffect(() => {
    carregarDados();
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

  const handleAbrirBloqueio = (dia: Date, livres: Dupla[], ocupadas: Dupla[]) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setDiaSelecionado(dia);
    setDuplasDisponiveisParaDia(livres);
    setDuplasOcupadasParaDia(ocupadas);
  };

  const handleSucessoBloqueio = () => {
    setDiaSelecionado(null);
    carregarDados();
  };

  const handleConflitoBloqueio = () => {
    setDiaSelecionado(null);
    carregarDados();
  };

  if (diaSelecionado) {
    return (
      <FormularioBloqueio
        data={diaSelecionado}
        duplasDisponiveis={duplasDisponiveisParaDia}
        duplasOcupadas={duplasOcupadasParaDia}
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
          🚫 Bloquear Datas
        </h1>
        <div className="w-10" />
      </header>

      {/* Aviso Admin */}
      <div className="w-full max-w-md mx-auto px-4 pt-4">
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-red-800 text-xs font-semibold">
          <span>⚠️</span>
          <span>Acesso administrativo — apenas em desenvolvimento</span>
        </div>
      </div>

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

              const duplasLivres: Dupla[] = [];
              const duplasOcupadas: Dupla[] = [];

              DUPLAS_CONFIG.forEach((conf) => {
                const registro = registrosDoDia.find((a) => a.dupla === conf.id);
                if (registro) {
                  // Qualquer registro existente (agendado ou bloqueado) = ocupada
                  duplasOcupadas.push(conf.id);
                } else {
                  duplasLivres.push(conf.id);
                }
              });

              const todasOcupadas = duplasLivres.length === 0;

              return (
                <div
                  key={diaISO}
                  className={`bg-white rounded-2xl border p-4.5 flex flex-col gap-3.5 shadow-xs transition-shadow ${
                    todasOcupadas
                      ? "border-gray-200 opacity-60"
                      : "border-gray-200 hover:shadow-sm"
                  }`}
                >
                  {/* Título do Dia */}
                  <div className="text-base font-bold text-gray-900">
                    {diaSemana}, {diaEMes}
                  </div>

                  {/* Badges de Status das Duplas */}
                  <div className="flex flex-wrap gap-2">
                    {DUPLAS_CONFIG.map((conf) => {
                      const isLivre = duplasLivres.includes(conf.id);
                      const registro = registrosDoDia.find((a) => a.dupla === conf.id);
                      const isBloqueada = registro
                        ? isDataDesabilitada(registro.data_desabilitada)
                        : false;

                      if (!isLivre) {
                        return (
                          <span
                            key={conf.id}
                            className="text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 bg-gray-100 text-gray-400 border border-gray-200"
                          >
                            <span>{conf.shortLabel}</span>
                            <span>{isBloqueada ? "Bloqueada" : "Agendada"}</span>
                          </span>
                        );
                      }

                      return (
                        <span
                          key={conf.id}
                          className={`text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 border ${conf.badgeBg} ${conf.badgeText} border-transparent`}
                        >
                          <span>{conf.shortLabel}</span>
                          <span>Livre</span>
                        </span>
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
                      onClick={() => handleAbrirBloqueio(dia, duplasLivres, duplasOcupadas)}
                      className="w-full py-3 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      Bloquear duplas neste dia
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
