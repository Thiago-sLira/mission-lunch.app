"use client";

import { useState } from "react";
import {
  BookingConflictError,
  Dupla,
  DUPLAS_CONFIG,
  NovoAgendamentoPayload,
} from "@/app/types/agendamento";
import { formatarTituloDia } from "@/app/utils/date";
import { criarAgendamentos } from "@/app/services/agendamentos";

interface FormularioBloqueioProps {
  data: Date;
  duplasDisponiveis: Dupla[];
  duplasOcupadas: Dupla[];
  onVoltar: () => void;
  onSucesso: () => void;
  onConflito: () => void;
}

export default function FormularioBloqueio({
  data,
  duplasDisponiveis,
  duplasOcupadas,
  onVoltar,
  onSucesso,
  onConflito,
}: FormularioBloqueioProps) {
  const [duplasSelecionadas, setDuplasSelecionadas] = useState<Dupla[]>(
    duplasDisponiveis.length === 1 ? [duplasDisponiveis[0]] : []
  );
  const [observacao, setObservacao] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [conflitoDuplas, setConflitoDuplas] = useState<Dupla[] | null>(null);

  const isUnicaDuplaDisponivel = duplasDisponiveis.length === 1;

  const toggleDupla = (id: Dupla) => {
    if (isUnicaDuplaDisponivel && duplasDisponiveis.includes(id)) return;
    if (duplasSelecionadas.includes(id)) {
      setDuplasSelecionadas(duplasSelecionadas.filter((d) => d !== id));
    } else {
      setDuplasSelecionadas([...duplasSelecionadas, id]);
    }
  };

  const { diaSemana, diaEMes } = formatarTituloDia(data);

  const formValido = duplasSelecionadas.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValido || enviando) return;

    setEnviando(true);
    setErroEnvio(null);

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    const dataISO = `${ano}-${mes}-${dia}`;

    const payload: NovoAgendamentoPayload[] = duplasSelecionadas.map((dupla) => ({
      data: dataISO,
      dupla,
      nome_familia: "",
      observacao: observacao.trim() || undefined,
      data_desabilitada: true,
    }));

    try {
      await criarAgendamentos(payload);
      setEnviando(false);
      onSucesso();
    } catch (err) {
      setEnviando(false);
      if (err instanceof BookingConflictError) {
        setConflitoDuplas(err.conflitos);
      } else {
        console.error(err);
        setErroEnvio("Ocorreu um erro ao registrar o bloqueio. Tente novamente.");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EEF2F7]">
      {/* Header */}
      <header
        className="w-full py-4 px-4 flex items-center justify-between sticky top-0 z-20 shadow-sm"
        style={{ backgroundColor: "#1B2A6B" }}
      >
        <button
          onClick={onVoltar}
          disabled={enviando}
          aria-label="Voltar"
          className="text-white hover:bg-white/10 p-2 rounded-full transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
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
          🚫 Confirmar Bloqueio
        </h1>
        <div className="w-10" />
      </header>

      {/* Formulário */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 flex flex-col gap-5">
        {/* Banner do Dia — tom de alerta */}
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2.5 text-red-900 font-bold text-base shadow-xs">
          <span>🚫</span>
          <span>
            {diaSemana}, {diaEMes}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Seção 1: Seleção de Duplas */}
          <div className="flex flex-col gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                1. Quais duplas serão bloqueadas?
              </h2>
              <p className="text-xs text-gray-500">
                Pode selecionar mais de uma opção
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              {DUPLAS_CONFIG.map((conf) => {
                const isOcupada = duplasOcupadas.includes(conf.id);
                const isDisponivel = duplasDisponiveis.includes(conf.id);
                const isSelected = duplasSelecionadas.includes(conf.id);

                if (!isDisponivel) {
                  return (
                    <div
                      key={conf.id}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-100/70 text-gray-400 opacity-60 cursor-not-allowed"
                    >
                      <input
                        type="checkbox"
                        disabled
                        checked={false}
                        className="w-5 h-5 rounded border-gray-300"
                      />
                      <span className="font-semibold text-sm">
                        {conf.label} ({isOcupada ? "Já ocupada" : "Indisponível"})
                      </span>
                    </div>
                  );
                }

                const isLockedSingle =
                  isUnicaDuplaDisponivel && duplasDisponiveis.includes(conf.id);

                return (
                  <label
                    key={conf.id}
                    onClick={() => toggleDupla(conf.id)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                      isLockedSingle ? "cursor-default" : "cursor-pointer"
                    } ${
                      isSelected
                        ? "border-red-600 bg-red-50/40 ring-1 ring-red-600"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isSelected
                          ? "bg-red-700 border-red-700 text-white"
                          : "border-gray-400 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3.5 h-3.5 stroke-current stroke-3"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="font-bold text-sm text-gray-900">
                      {conf.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Seção 2: Motivo */}
          <div className="flex flex-col gap-3.5">
            <h2 className="text-base font-bold text-gray-900">
              2. Motivo / Observação
            </h2>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="observacao"
                className="text-xs font-semibold text-gray-700"
              >
                Motivo / Observação <span className="text-gray-400">(Opcional)</span>
              </label>
              <input
                id="observacao"
                type="text"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex: P-Day, Conferência..."
                className="w-full px-3.5 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Erro de Envio */}
          {erroEnvio && (
            <div className="bg-red-100 border border-red-300 text-red-800 text-xs p-3 rounded-xl font-medium">
              {erroEnvio}
            </div>
          )}

          {/* Botão de Confirmação */}
          <div className="flex flex-col gap-2 pb-6">
            <button
              type="submit"
              disabled={!formValido || enviando}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm ${
                formValido && !enviando
                  ? "bg-red-700 text-white hover:bg-red-800 cursor-pointer shadow-md active:scale-[0.99]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-90"
              }`}
            >
              {enviando ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>BLOQUEANDO...</span>
                </div>
              ) : (
                "CONFIRMAR BLOQUEIO"
              )}
            </button>
            {!formValido && (
              <span className="text-center text-xs text-gray-500">
                Selecione ao menos uma dupla para bloquear
              </span>
            )}
          </div>
        </form>
      </main>

      {/* Modal de Conflito */}
      {conflitoDuplas && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Painel */}
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl flex flex-col gap-5 p-6">
            {/* Ícone de aviso */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-red-600 stroke-current"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <h2 className="text-base font-bold text-gray-900 leading-snug">
                Bloqueio não realizado
              </h2>
            </div>

            {/* Mensagem */}
            <p className="text-sm text-gray-700 leading-relaxed">
              Não foi possível bloquear. Uma ou mais duplas já possuem almoço agendado neste dia.
            </p>

            {/* Botão de ação */}
            <button
              onClick={onConflito}
              className="w-full py-3.5 bg-[#1B2A6B] hover:bg-[#152154] text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-sm active:scale-[0.99]"
            >
              Voltar para a lista
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
