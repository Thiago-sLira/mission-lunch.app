"use client";

import Header from "@/app/components/Header";
import ActionCard from "@/app/components/ActionCard";
import ReminderCard from "@/app/components/ReminderCard";

export default function Home() {
  const handleMarcarAlmoco = () => {};
  const handleVisualizarAlmocos = () => {};

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
              Olá! Seja bem-vindo(a)
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
              onClick={handleMarcarAlmoco}
            />

            <ActionCard
              icon="👀"
              title="VISUALIZAR ALMOÇOS"
              description="Consulte a escala dos próximos 5 dias"
              variant="outlined"
              onClick={handleVisualizarAlmocos}
            />
          </div>
        </div>

        {/* Lembrete no rodapé */}
        <div className="mt-auto pt-8">
          <ReminderCard message="Segunda-feira é P-Day (sem agendamento)." />
        </div>
      </main>
    </div>
  );
}
