"use client";

import { useState } from "react";
import { useAdmin } from "@/app/context/AdminContext";
import LoginAdminModal from "@/app/components/LoginAdminModal";
import LogoutButton from "@/app/components/LogoutButton";

export default function Header() {
  const { isAdmin } = useAdmin();
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <>
      <header
        className="relative w-full py-4 px-6 flex items-center justify-center"
        style={{ backgroundColor: "#1B2A6B" }}
      >
        <h1 className="text-2xl font-bold text-white tracking-wide">
          🍽️ Almoço dos Missionários
        </h1>

        {/* Admin: botão Sair | Visitante: cadeado para login */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isAdmin ? (
            <LogoutButton />
          ) : (
            <button
              onClick={() => setModalAberto(true)}
              aria-label="Entrar como administrador"
              className="flex items-center p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="rgba(255,255,255,0.55)"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
            </button>
          )}
        </div>
      </header>

      {modalAberto && (
        <LoginAdminModal onClose={() => setModalAberto(false)} />
      )}
    </>
  );
}
