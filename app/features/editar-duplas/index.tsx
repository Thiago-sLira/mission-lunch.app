"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { useAdmin } from "@/app/context/AdminContext";
import { ApiActionError, getMissionarios } from "@/app/services/missionarios";
import { agruparDuplas, DuplaInfo, Missionario } from "@/app/types/agendamento";
import FormularioDupla from "./FormularioDupla";
import ConfirmarExclusaoModal from "./ConfirmarExclusaoModal";

type ModalState =
  | { tipo: "criar" }
  | { tipo: "editar"; dupla: DuplaInfo }
  | { tipo: "excluir"; dupla: DuplaInfo }
  | null;

export default function EditarDuplas() {
  const router = useRouter();
  const { marcarSessaoExpirada } = useAdmin();

  const [missionarios, setMissionarios] = useState<Missionario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);

  const duplas = useMemo(() => agruparDuplas(missionarios), [missionarios]);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const data = await getMissionarios();
      setMissionarios(data);
    } catch (err) {
      console.error(err);
      if (err instanceof ApiActionError && err.code === "UNAUTHORIZED") {
        marcarSessaoExpirada();
        return;
      }
      setErro("Não foi possível carregar as duplas.");
    } finally {
      setCarregando(false);
    }
  }, [marcarSessaoExpirada]);

  useEffect(() => {
    (async () => {
      await carregarDados();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConcluido = () => {
    setModal(null);
    carregarDados();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EEF2F7]">
      <div className="sticky top-0 z-20 w-full shadow-sm">
        <Header />
        <div
          className="w-full px-4 pb-3 flex items-center justify-between"
          style={{ backgroundColor: "#1B2A6B" }}
        >
          <button
            onClick={() => router.push("/")}
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
          <h2 className="text-xl font-bold text-white tracking-wide">
            Editar Duplas
          </h2>
          <div className="w-10" />
        </div>
      </div>

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 flex flex-col gap-4">
        <button
          onClick={() => setModal({ tipo: "criar" })}
          disabled={carregando || !!erro}
          className="w-full py-3.5 bg-[#1B2A6B] hover:bg-[#152154] disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm tracking-wide transition-colors cursor-pointer shadow-sm active:scale-[0.99]"
        >
          + Adicionar Dupla
        </button>

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

        {!carregando && !erro && duplas.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-6">
            Nenhuma dupla cadastrada.
          </p>
        )}

        {!carregando && !erro && duplas.length > 0 && (
          <div className="flex flex-col gap-3.5 pb-8">
            {duplas.map((dupla) => (
              <div
                key={dupla.id}
                className="bg-white rounded-2xl border border-gray-200 p-4.5 flex flex-col gap-3.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-gray-900">
                    {dupla.label}
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-semibold ${dupla.badgeBg} ${dupla.badgeText}`}
                  >
                    {dupla.shortLabel}
                  </span>
                </div>

                <ul className="flex flex-col gap-1 text-sm text-gray-700 list-disc pl-5">
                  {dupla.nomes.map((nome, i) => (
                    <li key={`${nome}-${i}`}>{nome}</li>
                  ))}
                </ul>

                <div className="flex gap-2">
                  <button
                    onClick={() => setModal({ tipo: "editar", dupla })}
                    className="flex-1 py-2.5 border border-[#1B2A6B] text-[#1B2A6B] hover:bg-[#1B2A6B]/5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setModal({ tipo: "excluir", dupla })}
                    className="flex-1 py-2.5 border border-red-600 text-red-600 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <svg
                      className="w-4 h-4 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                    <span>Remover Dupla</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modal?.tipo === "criar" && (
        <FormularioDupla
          modo="criar"
          duplasExistentes={duplas}
          onFechar={() => setModal(null)}
          onSalvo={handleConcluido}
        />
      )}

      {modal?.tipo === "editar" && (
        <FormularioDupla
          modo="editar"
          duplaInicial={modal.dupla}
          duplasExistentes={duplas}
          onFechar={() => setModal(null)}
          onSalvo={handleConcluido}
        />
      )}

      {modal?.tipo === "excluir" && (
        <ConfirmarExclusaoModal
          dupla={modal.dupla}
          onCancelar={() => setModal(null)}
          onExcluido={handleConcluido}
        />
      )}
    </div>
  );
}
