"use client";

import { useEffect, useState } from "react";
import { useAdmin } from "@/app/context/AdminContext";
import { ApiActionError, excluirDupla } from "@/app/services/missionarios";
import { DuplaInfo } from "@/app/types/agendamento";

interface ConfirmarExclusaoModalProps {
  dupla: DuplaInfo;
  onCancelar: () => void;
  onExcluido: () => void;
}

export default function ConfirmarExclusaoModal({
  dupla,
  onCancelar,
  onExcluido,
}: ConfirmarExclusaoModalProps) {
  const { marcarSessaoExpirada } = useAdmin();
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !excluindo) onCancelar();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [excluindo, onCancelar]);

  const handleExcluir = async () => {
    if (excluindo) return;
    setExcluindo(true);
    setErro(null);
    try {
      await excluirDupla({ tipo: dupla.tipo, numero_dupla: dupla.numero });
      onExcluido();
    } catch (err) {
      console.error(err);
      if (err instanceof ApiActionError) {
        if (err.code === "UNAUTHORIZED") marcarSessaoExpirada();
        setErro(err.message);
      } else {
        setErro("Não foi possível excluir a dupla. Tente novamente.");
      }
      setExcluindo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => !excluindo && onCancelar()} />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="titulo-excluir-dupla"
        aria-describedby="msg-excluir-dupla"
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border-2 border-red-600 flex flex-col gap-4 p-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-red-600 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <h2
            id="titulo-excluir-dupla"
            className="text-base font-bold text-red-600 leading-snug"
          >
            Remover dupla
          </h2>
        </div>

        <p className="text-sm font-bold text-gray-900">{dupla.label}</p>

        <p id="msg-excluir-dupla" className="text-sm text-gray-700 leading-relaxed">
          Atenção: Ao remover esta dupla, TODOS os almoços já agendados para ela serão apagados permanentemente. Tem certeza que deseja excluir?
        </p>

        {erro && (
          <div
            role="alert"
            className="bg-red-100 border border-red-300 text-red-800 text-xs p-3 rounded-xl font-medium"
          >
            {erro}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancelar}
            disabled={excluindo}
            className="flex-1 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-bold text-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleExcluir}
            disabled={excluindo}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {excluindo ? "Excluindo..." : "Sim, excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
