"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import { useAdmin } from "@/app/context/AdminContext";
import ActionCard from "@/app/components/ActionCard";
import MarcarAlmoco from "@/app/features/marcar-almoco";
import VisualizarAlmocos from "@/app/features/visualizar-almoco";
import BloquearDatas from "@/app/features/bloquear-datas";

type View = "home" | "marcar" | "visualizar" | "bloquear";

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("home");
  const { isAdmin } = useAdmin();
  const router = useRouter();

  if (currentView === "marcar") {
    return <MarcarAlmoco onVoltar={() => setCurrentView("home")} />;
  }

  if (currentView === "visualizar") {
    return <VisualizarAlmocos onVoltar={() => setCurrentView("home")} />;
  }

  if (currentView === "bloquear" && isAdmin) {
    return <BloquearDatas onVoltar={() => setCurrentView("home")} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)]">
      <div className="sticky top-0 z-10 w-full">
        <Header />
      </div>

      <main className="flex-1 w-full max-w-md mx-auto px-5 py-6 flex flex-col">
        <div className="flex flex-col gap-6">
          {/* Seção de boas-vindas */}
          <div className="flex flex-col gap-1 pt-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Ala Canhema Taboão
            </h2>
            <p className="text-base text-gray-600">
              Escolha uma opção para continuar:
            </p>
          </div>

          {/* Cards de Ação */}
          <div className="flex flex-col gap-4">
            <ActionCard
              icon="📅"
              title="MARCAR ALMOÇO"
              description="Escolha um dia e ofereça uma refeição às duplas"
              variant="filled"
              onClick={() => setCurrentView("marcar")}
            />

            <ActionCard
              icon="👀"
              title="VISUALIZAR ALMOÇOS"
              description="Consulte a escala do mês atual ou do próximo mês"
              variant="outlined"
              onClick={() => setCurrentView("visualizar")}
            />

            {isAdmin && (
              <ActionCard
                icon="🚫"
                title="BLOQUEAR DATAS"
                description="Desabilitar dias na escala (Acesso Admin)"
                variant="outlined"
                onClick={() => setCurrentView("bloquear")}
              />
            )}

            {isAdmin && (
              <ActionCard
                icon="👥"
                title="EDITAR DUPLAS"
                description="Adicionar, editar ou remover duplas de missionários"
                variant="outlined"
                onClick={() => router.push("/editar-duplas")}
              />
            )}
          </div>
        </div>

        {/* Rodapé comunitário */}
        <p className="mt-auto pt-8 text-xs text-center text-gray-400">
          Aplicação comunitária sem fins lucrativos desenvolvida para apoio ao trabalho missionário
        </p>
      </main>
    </div>
  );
}
