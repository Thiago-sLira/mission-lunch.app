"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/app/context/AdminContext";

interface LogoutButtonProps {
  /** Chamado após sair; use para voltar à Home quando a tela é controlada por estado */
  onSair?: () => void;
}

/**
 * Botão "Sair" do modo administrador. Renderiza apenas quando isAdmin === true.
 * Encerra a sessão no servidor (cookie httpOnly), zera o contexto e volta à Home.
 * Quando não é admin, renderiza um espaçador para manter o título centralizado.
 */
export default function LogoutButton({ onSair }: LogoutButtonProps) {
  const { isAdmin, logout } = useAdmin();
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  if (!isAdmin) return <div className="w-10" />;

  async function handleLogout() {
    if (saindo) return;
    setSaindo(true);
    try {
      await logout();
    } catch (err) {
      console.error(err);
    } finally {
      setSaindo(false);
      onSair?.();
      router.push("/");
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={saindo}
      aria-label="Sair do modo administrador"
      title="Sair"
      className="flex items-center gap-1 p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
        />
      </svg>
      <span className="text-xs font-bold">Sair</span>
    </button>
  );
}
