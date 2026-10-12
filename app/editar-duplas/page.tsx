"use client";

import Link from "next/link";
import Header from "@/app/components/Header";
import { useAdmin } from "@/app/context/AdminContext";
import EditarDuplas from "@/app/features/editar-duplas";

export default function EditarDuplasPage() {
  const { isAdmin, carregando } = useAdmin();

  if (carregando) {
    return (
      <div className="flex flex-col min-h-screen bg-[#EEF2F7]">
        <div className="sticky top-0 z-10 w-full">
          <Header />
        </div>
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600 text-sm font-medium">
            <span className="w-5 h-5 border-2 border-[#1B2A6B] border-t-transparent rounded-full animate-spin" />
            <span>Carregando...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-[#EEF2F7]">
        <div className="sticky top-0 z-10 w-full">
          <Header />
        </div>
        <main className="flex-1 w-full max-w-md mx-auto px-5 py-10 flex flex-col items-center gap-4 text-center">
          <p className="text-base font-semibold text-gray-900">
            Acesso restrito ao administrador.
          </p>
          <Link
            href="/"
            className="text-sm font-bold text-[#1B2A6B] underline hover:opacity-80"
          >
            Voltar para o início
          </Link>
        </main>
      </div>
    );
  }

  return <EditarDuplas />;
}
