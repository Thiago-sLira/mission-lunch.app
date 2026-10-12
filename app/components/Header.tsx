"use client";

import { useState } from "react";
import { useAdmin } from "@/app/context/AdminContext";
import LoginAdminModal from "@/app/components/LoginAdminModal";

export default function Header() {
  const { isAdmin, logout } = useAdmin();
  const [modalAberto, setModalAberto] = useState(false);

  async function handleAdminClick() {
    if (isAdmin) {
      if (window.confirm("Sair do modo administrador?")) {
        await logout();
      }
    } else {
      setModalAberto(true);
    }
  }

  return (
    <>
      <header
        className="relative w-full py-4 px-6 flex items-center justify-center"
        style={{ backgroundColor: "#1B2A6B" }}
      >
        <h1 className="text-2xl font-bold text-white tracking-wide">
          🍽️ Almoço dos Missionários
        </h1>

        {/* Botão admin */}
        <button
          onClick={handleAdminClick}
          aria-label={isAdmin ? "Sair do modo administrador" : "Entrar como administrador"}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          {isAdmin ? (
            <>
              {/* Ícone cadeado aberto (admin ativo) */}
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
              <span className="text-xs font-bold text-white bg-white/20 px-1.5 py-0.5 rounded-md">
                Admin
              </span>
            </>
          ) : (
            /* Ícone cadeado fechado (deslogado) */
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
          )}
        </button>
      </header>

      {modalAberto && (
        <LoginAdminModal onClose={() => setModalAberto(false)} />
      )}
    </>
  );
}
