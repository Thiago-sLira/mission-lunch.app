"use client";

import { useEffect, useState, useTransition } from "react";
import { Agendamento, DUPLAS_CONFIG, Dupla, isDataDesabilitada } from "@/app/types/agendamento";
import { getAgendamentos } from "@/app/services/agendamentos";
import {
  formatarDataISO,
  formatarTituloDia,
  getDiasDoMes,
  MESES,
} from "@/app/utils/date";
import FormularioAgendamento from "./FormularioAgendamento";

interface MarcarAlmocoProps {
  onVoltar?: () => void;
}

export default function MarcarAlmoco({ onVoltar }: MarcarAlmocoProps) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  // Mês seguinte
  const mesSeguinte = mesAtual === 11 ? 0 : mesAtual + 1;
  const anoSeguinte = mesAtual === 11 ? anoAtual + 1 : anoAtual;

  const [ano, setAno] = useState(anoAtual);
  const [mes, setMes] = useState(mesAtual);

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Sub-fluxo: Dia selecionado para preencher o formulário
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);
  const [duplasDisponiveisParaDia, setDuplasDisponiveisParaDia] = useState<Dupla[]>([]);
  const [duplasDesabilitadasParaDia, setDuplasDesabilitadasParaDia] = useState<Dupla[]>([]);
  const [sucesso, setSucesso] = useState(false);

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
    if (isMesAtual) return; // Bloqueado além do mês atual
    setAno(anoAtual);
    setMes(mesAtual);
  };

  const handleProximoMes = () => {
    if (isMesSeguinte) return; // Bloqueado além do mês seguinte
    setAno(anoSeguinte);
    setMes(mesSeguinte);
  };

  const diasDoMes = getDiasDoMes(ano, mes);
  const mesNome = MESES[mes];

  const handleAbrirAgendamento = (dia: Date, disponiveis: Dupla[], desabilitadas: Dupla[]) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setDiaSelecionado(dia);
    setDuplasDisponiveisParaDia(disponiveis);
    setDuplasDesabilitadasParaDia(desabilitadas);
  };

  const handleSucessoAgendamento = () => {
    setSucesso(true);
    setDiaSelecionado(null);
    carregarDados();
  };

  // Se o usuário estiver na tela de formulário de confirmação
  if (diaSelecionado) {
    return (
      <FormularioAgendamento
        data={diaSelecionado}
        duplasDisponiveis={duplasDisponiveisParaDia}
        duplasDesabilitadas={duplasDesabilitadasParaDia}
        onVoltar={() => setDiaSelecionado(null)}
        onSucesso={handleSucessoAgendamento}
      />
    );
  }

  // Tela de Sucesso
  if (sucesso) {
    return (
      <div className="flex flex-col min-h-screen bg-[#EEF2F7]">
        <header
          className="w-full py-4 px-4 flex items-center justify-center sticky top-0 z-20 shadow-sm"
          style={{ backgroundColor: "#1B2A6B" }}
        >
          <h1 className="text-xl font-bold text-white tracking-wide">
            Agendamento Confirmado!
          </h1>
        </header>

        <main className="flex-1 w-full max-w-md mx-auto px-5 py-12 flex flex-col items-center justify-center text-center gap-5">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl shadow-inner">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Muito obrigado!</h2>
          <p className="text-sm text-gray-600 max-w-xs">
            Seu agendamento foi registrado com sucesso na planilha de almoço dos missionários.
          </p>

          <div className="flex flex-col gap-3 w-full pt-4">
            <button
              onClick={() => setSucesso(false)}
              className="w-full py-3.5 bg-[#1B2A6B] text-white font-bold rounded-xl shadow-sm hover:bg-[#152154] cursor-pointer"
            >
              Fazer outro agendamento
            </button>
            <button
              onClick={onVoltar}
              className="w-full py-3.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
            >
              Voltar ao Início
            </button>
          </div>
        </main>
      </div>
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
          Escolher Data
        </h1>
        <div className="w-10" />
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 flex flex-col gap-4">
        {/* Navegador de Mês (Apenas mês atual e próximo mês) */}
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

        {/* Legenda */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs px-2.5 py-1 rounded-md font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200/60">
            Disponível para agendamento
          </span>
          <span className="text-xs px-2.5 py-1 rounded-md font-semibold border bg-gray-100 text-gray-500 border-gray-200">
            Almoço já agendado ou indisponível
          </span>
        </div>

        {/* Subtítulo */}
        <div className="pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            DIAS DISPONÍVEIS
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

              // Checar se o dia é no passado
              const hojeClean = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
              const diaClean = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());
              const isPassado = diaClean.getTime() < hojeClean.getTime();

              // Registros deste dia na planilha
              const registrosDoDia = agendamentos.filter(
                (a) => a.data && a.data.startsWith(diaISO)
              );

              // Identificar disponibilidade por dupla
              const duplasLivres: Dupla[] = [];
              const duplasAgendadas: Dupla[] = [];
              const duplasDesabilitadas: Dupla[] = [];

              DUPLAS_CONFIG.forEach((conf) => {
                const registro = registrosDoDia.find((a) => a.dupla === conf.id);
                if (registro) {
                  if (isDataDesabilitada(registro.data_desabilitada)) {
                    duplasDesabilitadas.push(conf.id);
                  } else if (registro.nome_familia && registro.nome_familia.trim().length > 0) {
                    duplasAgendadas.push(conf.id);
                  } else {
                    // Registro existe mas sem nome e não desabilitado -> livre
                    duplasLivres.push(conf.id);
                  }
                } else {
                  // Sem nenhum registro -> livre
                  duplasLivres.push(conf.id);
                }
              });

              // Caso todas as 3 duplas estejam com data_desabilitada
              const todasDesabilitadas = duplasDesabilitadas.length === DUPLAS_CONFIG.length;

              if (todasDesabilitadas) {
                return (
                  <div
                    key={diaISO}
                    className="bg-[#F8FAFC] border border-gray-200/90 rounded-2xl p-4 flex flex-col gap-1.5 opacity-80 shadow-xs"
                  >
                    <div className="text-sm font-bold text-gray-700">
                      {diaSemana}, {diaEMes}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
                      <span>🔒</span>
                      <span>Data indisponível para agendamento</span>
                    </div>
                  </div>
                );
              }

              const totalmenteOcupado = duplasLivres.length === 0;
              const podeAgendar = !isPassado && !totalmenteOcupado;

              return (
                <div
                  key={diaISO}
                  className={`bg-white rounded-2xl border p-4.5 flex flex-col gap-3.5 shadow-xs transition-shadow ${
                    podeAgendar ? "border-gray-200 hover:shadow-sm" : "border-gray-200 opacity-60"
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
                      const isDesabilitada = duplasDesabilitadas.includes(conf.id);

                      return (
                        <span
                          key={conf.id}
                          className={`text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 ${
                            isLivre
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : isDesabilitada
                              ? "bg-gray-100 text-gray-500 border border-gray-200"
                              : "bg-gray-100 text-gray-400 border border-gray-200"
                          }`}
                        >
                          <span>{conf.shortLabel}</span>
                          {isLivre && <span>Livre</span>}
                          {!isLivre && isDesabilitada && <span>Indisponível</span>}
                        </span>
                      );
                    })}
                  </div>

                  {/* Botão de Agendamento */}
                  {isPassado ? (
                    <button
                      disabled
                      className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm cursor-not-allowed"
                    >
                      Data no passado
                    </button>
                  ) : totalmenteOcupado ? (
                    <button
                      disabled
                      className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm cursor-not-allowed"
                    >
                      Todos os almoços preenchidos
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        handleAbrirAgendamento(dia, duplasLivres, duplasDesabilitadas)
                      }
                      className="w-full py-3 bg-[#1B2A6B] hover:bg-[#152154] text-white rounded-xl font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      Agendar para este dia
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
