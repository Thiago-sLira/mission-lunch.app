"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  adminLogin,
  adminLogout,
  getAdminSession,
} from "@/app/services/admin";

interface AdminContextValue {
  isAdmin: boolean;
  carregando: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  marcarSessaoExpirada: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    getAdminSession()
      .then((result) => setIsAdmin(result))
      .finally(() => setCarregando(false));
  }, []);

  async function login(email: string, password: string): Promise<void> {
    await adminLogin(email, password);
    setIsAdmin(true);
  }

  async function logout(): Promise<void> {
    await adminLogout();
    setIsAdmin(false);
  }

  function marcarSessaoExpirada(): void {
    setIsAdmin(false);
  }

  return (
    <AdminContext.Provider
      value={{ isAdmin, carregando, login, logout, marcarSessaoExpirada }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin deve ser usado dentro de AdminProvider");
  }
  return ctx;
}
