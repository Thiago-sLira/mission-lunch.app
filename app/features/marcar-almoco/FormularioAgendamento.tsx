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

interface FormularioAgendamentoProps {
  data: Date;
  duplasDisponiveis: Dupla[];
  duplasDesabilitadas: Dupla[];
  onVoltar: () => void;
  onSucesso: () => void;
  /** Chamado ao receber conflito: o pai deve recarregar dados e voltar à grade */
  onConflito: () => void;
}

export default function FormularioAgendamento({
  data,
  duplasDisponiveis,
  duplasDesabilitadas,
  onVoltar,
  onSucesso,
  onConflito,
}: FormularioAgendamentoProps) {
  const [duplasSelecionadas, setDuplasSelecionadas] = useState<Dupla[]>(
    duplasDisponiveis.length === 1 ? [duplasDisponiveis[0]] : []
  );
  const [nomeFamilia, setNomeFamilia] = useState("");
  const [nomeError, setNomeError] = useState<string | null>(null);
  const [observacao, setObservacao] = useState("");
  const [termoAceito, setTermoAceito] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [conflitoDuplas, setConflitoDuplas] = useState<Dupla[] | null>(null);

  const isUnicaDuplaDisponivel = duplasDisponiveis.length === 1;

  const toggleDupla = (id: Dupla) => {
    // Não permite desmarcar se é a única opção disponível
    if (isUnicaDuplaDisponivel && duplasDisponiveis.includes(id)) return;
    if (duplasSelecionadas.includes(id)) {
      setDuplasSelecionadas(duplasSelecionadas.filter((d) => d !== id));
    } else {
      setDuplasSelecionadas([...duplasSelecionadas, id]);
    }
  };

  const handleNomeBlur = () => {
    const trimmed = nomeFamilia.trim();
    if (trimmed.length > 0 && trimmed.length < 4) {
      setNomeError(
        "Por favor, informe seu nome e sobrenome ou nome da família (mínimo de 4 caracteres)"
      );
    } else {
      setNomeError(null);
    }
  };

  const { diaSemana, diaEMes } = formatarTituloDia(data);

  const formValido =
    duplasSelecionadas.length > 0 &&
    nomeFamilia.trim().length >= 4 &&
    termoAceito;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValido || enviando) return;

    setEnviando(true);
    setErroEnvio(null);

    // Formatar data em YYYY-MM-DD
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    const dataISO = `${ano}-${mes}-${dia}`;

    const payload: NovoAgendamentoPayload[] = duplasSelecionadas.map((dupla) => ({
      data: dataISO,
      dupla,
      nome_familia: nomeFamilia.trim(),
      observacao: observacao.trim() || undefined,
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
        setErroEnvio("Ocorreu um erro ao salvar o agendamento. Tente novamente.");
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
          Confirmar Almoço
        </h1>
        <div className="w-10" />
      </header>

      {/* Formulário */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 flex flex-col gap-5">
        {/* Banner do Dia Selecionado */}
        <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl px-4 py-3 flex items-center gap-2.5 text-[#1B2A6B] font-bold text-base shadow-xs">
          <span>📅</span>
          <span>
            {diaSemana}, {diaEMes}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Seção 1: Seleção de Duplas */}
          <div className="flex flex-col gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                1. Para quem será o almoço?
              </h2>
              <p className="text-xs text-gray-500">
                Pode selecionar mais de uma opção
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              {DUPLAS_CONFIG.map((conf) => {
                const isDesabilitada = duplasDesabilitadas.includes(conf.id);
                const isDisponivel = duplasDisponiveis.includes(conf.id);
                const isSelected = duplasSelecionadas.includes(conf.id);

                if (!isDisponivel) {
                  const legenda = isDesabilitada
                    ? "Indisponível"
                    : "Já agendado";

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
                        {conf.label} ({legenda})
                      </span>
                    </div>
                  );
                }

                const isLockedSingle = isUnicaDuplaDisponivel && duplasDisponiveis.includes(conf.id);

                return (
                  <label
                    key={conf.id}
                    onClick={() => toggleDupla(conf.id)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                      isLockedSingle ? "cursor-default" : "cursor-pointer"
                    } ${
                      isSelected
                        ? "border-[#1B2A6B] bg-blue-50/40 ring-1 ring-[#1B2A6B]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                        isSelected
                          ? "bg-[#1B2A6B] border-[#1B2A6B] text-white"
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

          {/* Seção 2: Dados do Usuário */}
          <div className="flex flex-col gap-3.5">
            <h2 className="text-base font-bold text-gray-900">2. Seus dados</h2>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="nome_familia"
                className="text-xs font-semibold text-gray-700"
              >
                Nome e Sobrenome / Família <span className="text-red-500">*</span>
              </label>
              <input
                id="nome_familia"
                type="text"
                required
                value={nomeFamilia}
                onChange={(e) => {
                  setNomeFamilia(e.target.value);
                  if (nomeError && e.target.value.trim().length >= 4) setNomeError(null);
                }}
                onBlur={handleNomeBlur}
                placeholder="Nome e Sobrenome ou Família"
                className={`w-full px-3.5 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B2A6B] focus:border-transparent text-sm ${
                  nomeError ? "border-red-400" : "border-gray-300"
                }`}
              />
              {nomeError && (
                <p className="text-xs text-red-600 mt-0.5">{nomeError}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="observacao"
                className="text-xs font-semibold text-gray-700"
              >
                Instruções para os missionários (opcional)
              </label>
              <input
                id="observacao"
                type="text"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B2A6B] focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Lembretes Importantes / Termo */}
          <div className="bg-red-50/60 border border-red-200/80 rounded-2xl p-4 flex flex-col gap-3">
            <span className="font-bold text-xs uppercase tracking-wider text-red-900">
              Lembretes Importantes:
            </span>
            <ol className="text-xs text-red-950 space-y-1.5 list-decimal pl-4 leading-relaxed font-medium">
              <li>Apenas refeição pronta (almoço em alimento).</li>
              <li>
                Regras da casa (adultos 18+ presentes):
                <ul className="list-disc pl-4 pt-1 space-y-0.5 text-red-900 font-normal">
                  <li>
                    <strong className="font-semibold text-red-950">Apenas Élderes:</strong> precisa de pelo menos um homem adulto presente.
                  </li>
                  <li>
                    <strong className="font-semibold text-red-950">Apenas Sisteres:</strong> precisa de pelo menos uma mulher adulta presente.
                  </li>
                  <li>
                    <strong className="font-semibold text-red-950">Élderes e Sisteres:</strong> precisa de pelo menos um homem adulto e pelo menos uma mulher adulta presentes.
                  </li>
                </ul>
              </li>
            </ol>

            <div className="border-t border-dashed border-red-200 pt-3">
              <label
                onClick={() => setTermoAceito(!termoAceito)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                    termoAceito
                      ? "bg-red-600 border-red-600 text-white"
                      : "border-red-400 bg-white"
                  }`}
                >
                  {termoAceito && (
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
                <span className="text-xs font-bold text-red-900 select-none">
                  Estou ciente e concordo com os lembretes acima
                </span>
              </label>
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
                  ? "bg-[#1B2A6B] text-white hover:bg-[#152154] cursor-pointer shadow-md active:scale-[0.99]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-90"
              }`}
            >
              {enviando ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>VERIFICANDO E AGENDANDO...</span>
                </div>
              ) : (
                "CONFIRMAR AGENDAMENTO"
              )}
            </button>
            {!formValido && (
              <span className="text-center text-xs text-gray-500">
                {!termoAceito
                  ? "Marque a caixa de ciência acima para liberar o botão"
                  : duplasSelecionadas.length === 0
                  ? "Selecione ao menos uma dupla"
                  : "Preencha seu nome / família"}
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
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <svg
                  className="w-5 h-5 text-amber-600 stroke-current"
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
                Agendamento indisponível
              </h2>
            </div>

            {/* Mensagem */}
            <p className="text-sm text-gray-700 leading-relaxed">
              Ops!{" "}
              {conflitoDuplas.length === 1 ? (
                <>
                  O agendamento para{" "}
                  <strong className="font-semibold text-gray-900">
                    {DUPLAS_CONFIG.find((c) => c.id === conflitoDuplas[0])?.label}
                  </strong>{" "}
                  acabou de ser preenchido por outra pessoa ou ficou indisponível nesta data.
                </>
              ) : (
                <>
                  Os agendamentos para{" "}
                  <strong className="font-semibold text-gray-900">
                    {conflitoDuplas
                      .map((id) => DUPLAS_CONFIG.find((c) => c.id === id)?.label)
                      .join(" e ")}
                  </strong>{" "}
                  acabaram de ser preenchidos por outra pessoa ou ficaram indisponíveis nesta data.
                </>
              )}
            </p>

            {/* Botão de ação */}
            <button
              onClick={onConflito}
              className="w-full py-3.5 bg-[#1B2A6B] hover:bg-[#152154] text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-sm active:scale-[0.99]"
            >
              Escolher outro dia ou dupla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
