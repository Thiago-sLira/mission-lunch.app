import {
  ApiActionError,
  ExcluirDuplaPayload,
  Missionario,
  SalvarDuplaPayload,
} from "@/app/types/agendamento";

export { ApiActionError };

export async function getMissionarios(): Promise<Missionario[]> {
  const res = await fetch("/api/agendamentos?action=missionarios", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao buscar missionários.");
  }

  const data = await res.json();
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

export async function salvarDupla(
  payload: SalvarDuplaPayload
): Promise<void> {
  const res = await fetch("/api/agendamentos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "salvar_dupla", ...payload }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new ApiActionError(
        "UNAUTHORIZED",
        "Sessão de administrador expirada. Faça login novamente."
      );
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao salvar dupla.");
  }

  const data = (await res.json().catch(() => ({}))) as {
    status?: string;
    code?: string;
    message?: string;
  };

  if (data?.status === "error") {
    throw new ApiActionError(
      data.code ?? "UNKNOWN",
      data.message ?? "Erro ao salvar dupla."
    );
  }
}

export async function excluirDupla(
  payload: ExcluirDuplaPayload
): Promise<void> {
  const res = await fetch("/api/agendamentos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "excluir_dupla", ...payload }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new ApiActionError(
        "UNAUTHORIZED",
        "Sessão de administrador expirada. Faça login novamente."
      );
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao excluir dupla.");
  }

  const data = (await res.json().catch(() => ({}))) as {
    status?: string;
    code?: string;
    message?: string;
  };

  if (data?.status === "error") {
    throw new ApiActionError(
      data.code ?? "UNKNOWN",
      data.message ?? "Erro ao excluir dupla."
    );
  }
}
