"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/app/context/AdminContext";
import { ApiActionError, salvarDupla } from "@/app/services/missionarios";
import { DuplaInfo, TipoMissionario } from "@/app/types/agendamento";

interface FormularioDuplaProps {
  modo: "criar" | "editar";
  duplaInicial?: DuplaInfo;
  duplasExistentes: DuplaInfo[];
  onFechar: () => void;
  onSalvo: () => void;
}

const MAX_NOMES = 10;
const MIN_NOMES = 2;

function proximoNumero(tipo: TipoMissionario, duplas: DuplaInfo[]): number {
  const numeros = duplas.filter((d) => d.tipo === tipo).map((d) => d.numero);
  return numeros.length > 0 ? Math.max(...numeros) + 1 : 1;
}

export default function FormularioDupla({
  modo,
  duplaInicial,
  duplasExistentes,
  onFechar,
  onSalvo,
}: FormularioDuplaProps) {
  const { marcarSessaoExpirada } = useAdmin();
  const editando = modo === "editar";

  const [tipo, setTipo] = useState<TipoMissionario>(
    duplaInicial?.tipo ?? "ELDER"
  );
  const [numero, setNumero] = useState<string>(
    duplaInicial
      ? String(duplaInicial.numero)
      : String(proximoNumero("ELDER", duplasExistentes))
  );
  const [nomes, setNomes] = useState<string[]>(
    duplaInicial && duplaInicial.nomes.length > 0
      ? [...duplaInicial.nomes]
      : ["", ""]
  );
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !enviando) onFechar();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [enviando, onFechar]);

  const handleTipoChange = (novoTipo: TipoMissionario) => {
    setTipo(novoTipo);
    setNumero(String(proximoNumero(novoTipo, duplasExistentes)));
    setErroEnvio(null);
  };

  const handleNomeChange = (index: number, valor: string) => {
    setNomes((prev) => prev.map((n, i) => (i === index ? valor : n)));
    setErroEnvio(null);
  };

  const handleAdicionarNome = () => {
    setNomes((prev) => (prev.length < MAX_NOMES ? [...prev, ""] : prev));
  };

  const handleRemoverNome = (index: number) => {
    setNomes((prev) =>
      prev.length > MIN_NOMES ? prev.filter((_, i) => i !== index) : prev
    );
  };

  const numeroInt = Number(numero);
  const numeroValido =
    Number.isInteger(numeroInt) && numeroInt >= 1 && numeroInt <= 999;
  const duplaJaExiste =
    !editando &&
    numeroValido &&
    duplasExistentes.some((d) => d.tipo === tipo && d.numero === numeroInt);

  const nomesLimpos = nomes.map((n) => n.trim()).filter((n) => n !== "");
  const formValido =
    numeroValido && !duplaJaExiste && nomesLimpos.length >= MIN_NOMES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValido || enviando) return;

    const vistos = new Set<string>();
    for (const nome of nomesLimpos) {
      const chave = nome.toLowerCase();
      if (vistos.has(chave)) {
        setErroEnvio(`O nome "${nome}" está repetido. Os nomes devem ser diferentes.`);
        return;
      }
      vistos.add(chave);
    }

    setEnviando(true);
    setErroEnvio(null);
    try {
      await salvarDupla({ tipo, numero_dupla: numeroInt, nomes: nomesLimpos });
      onSalvo();
    } catch (err) {
      console.error(err);
      if (err instanceof ApiActionError) {
        if (err.code === "UNAUTHORIZED") marcarSessaoExpirada();
        setErroEnvio(err.message);
      } else {
        setErroEnvio("Não foi possível salvar a dupla. Tente novamente.");
      }
      setEnviando(false);
    }
  };

  const inputBase =
    "w-full px-3.5 py-3 rounded-xl border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B2A6B]/40 focus:border-[#1B2A6B] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => !enviando && onFechar()} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-form-dupla"
        className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-6"
      >
        <h2
          id="titulo-form-dupla"
          className="text-base font-bold text-[#1B2A6B] mb-4"
        >
          {editando ? "Editar Dupla" : "Adicionar Dupla"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Tipo */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dupla-tipo" className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Tipo
            </label>
            <select
              id="dupla-tipo"
              required
              value={tipo}
              disabled={editando || enviando}
              onChange={(e) => handleTipoChange(e.target.value as TipoMissionario)}
              className={inputBase}
            >
              <option value="ELDER">Élderes</option>
              <option value="SISTER">Sisteres</option>
            </select>
          </div>

          {/* Número */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dupla-numero" className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Número
            </label>
            <input
              id="dupla-numero"
              type="number"
              min={1}
              max={999}
              step={1}
              required
              value={numero}
              disabled={editando || enviando}
              onChange={(e) => {
                setNumero(e.target.value);
                setErroEnvio(null);
              }}
              className={inputBase}
            />
            {duplaJaExiste && (
              <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Já existe uma dupla deste tipo com o número {numeroInt}. Escolha outro número.
              </p>
            )}
          </div>

          {/* Nomes */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Missionários
            </span>
            {nomes.map((nome, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={80}
                  value={nome}
                  disabled={enviando}
                  onChange={(e) => handleNomeChange(index, e.target.value)}
                  placeholder={`Nome do missionário ${index + 1}`}
                  aria-label={`Nome do missionário ${index + 1}`}
                  className={inputBase}
                />
                <button
                  type="button"
                  onClick={() => handleRemoverNome(index)}
                  disabled={nomes.length <= MIN_NOMES || enviando}
                  aria-label={`Remover missionário ${index + 1}`}
                  className="shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <svg
                    className="w-5 h-5 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAdicionarNome}
              disabled={nomes.length >= MAX_NOMES || enviando}
              className="self-start text-sm font-bold text-[#1B2A6B] hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
            >
              + Adicionar missionário
            </button>
          </div>

          {/* Erro */}
          {erroEnvio && (
            <div
              role="alert"
              className="bg-red-100 border border-red-300 text-red-800 text-xs p-3 rounded-xl font-medium"
            >
              {erroEnvio}
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onFechar}
              disabled={enviando}
              className="flex-1 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formValido || enviando}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                formValido && !enviando
                  ? "bg-[#1B2A6B] text-white hover:bg-[#152154] cursor-pointer shadow-sm active:scale-[0.99]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {enviando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
