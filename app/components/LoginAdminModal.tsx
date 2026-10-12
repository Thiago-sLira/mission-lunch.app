"use client";

import { useEffect, useRef, useState } from "react";
import { useAdmin } from "@/app/context/AdminContext";

interface LoginAdminModalProps {
  onClose: () => void;
}

export default function LoginAdminModal({ onClose }: LoginAdminModalProps) {
  const { login } = useAdmin();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);

  // Focus first field on open
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    setSenha("");
    setErro(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await login(email, senha);
      handleClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Credenciais inválidas";
      setErro(message || "Credenciais inválidas");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-admin-title"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* Painel */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl flex flex-col gap-5 p-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1B2A6B]/10 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="#1B2A6B"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
          <h2
            id="login-admin-title"
            className="text-base font-bold text-gray-900 leading-snug"
          >
            Acesso administrativo
          </h2>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-email"
              className="text-sm font-medium text-gray-700"
            >
              E-mail
            </label>
            <input
              ref={emailRef}
              id="admin-email"
              type="email"
              autoComplete="username"
              maxLength={254}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B2A6B]/40 focus:border-[#1B2A6B] transition-colors"
              placeholder="admin@exemplo.com"
              disabled={carregando}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="admin-senha"
              className="text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              id="admin-senha"
              type="password"
              autoComplete="current-password"
              maxLength={256}
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B2A6B]/40 focus:border-[#1B2A6B] transition-colors"
              placeholder="••••••••"
              disabled={carregando}
            />
          </div>

          {erro && (
            <p className="text-sm text-red-600 font-medium" role="alert">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando || !email || !senha}
            className="w-full py-3.5 bg-[#1B2A6B] hover:bg-[#152154] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shadow-sm active:scale-[0.99]"
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>

          <button
            type="button"
            onClick={handleClose}
            disabled={carregando}
            className="w-full py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}
