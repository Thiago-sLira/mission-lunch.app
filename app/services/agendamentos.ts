import {
  Agendamento,
  ApiActionError,
  BookingConflictError,
  ConflictResponse,
  Dupla,
  NovoAgendamentoPayload,
} from "@/app/types/agendamento";

export async function getAgendamentos(): Promise<Agendamento[]> {
  const res = await fetch("/api/agendamentos?action=agendamentos", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao buscar agendamentos.");
  }

  const data = await res.json();
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

export async function criarAgendamentos(
  payload: NovoAgendamentoPayload[]
): Promise<void> {
  const res = await fetch("/api/agendamentos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "agendar", data: payload }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Sessão de administrador expirada. Faça login novamente.");
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao registrar agendamentos.");
  }

  const data = await res.json() as { status: string } & Partial<ConflictResponse>;

  if (data.status === "conflict" && data.conflitos) {
    throw new BookingConflictError(
      data.conflitos,
      data.message ?? "Uma ou mais duplas selecionadas já foram agendadas ou estão indisponíveis para esta data."
    );
  }
}

/** Remove um agendamento/bloqueio (admin), liberando a dupla na data. */
export async function excluirAgendamento(data: string, dupla: Dupla): Promise<void> {
  const res = await fetch("/api/agendamentos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "excluir_agendamento", data, dupla }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new ApiActionError(
        "UNAUTHORIZED",
        "Sessão de administrador expirada. Faça login novamente."
      );
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao liberar a data.");
  }

  const resposta = (await res.json().catch(() => ({}))) as {
    status?: string;
    code?: string;
    message?: string;
  };

  if (resposta?.status === "error") {
    throw new ApiActionError(
      resposta.code ?? "UNKNOWN",
      resposta.message ?? "Erro ao liberar a data."
    );
  }
}
