import {
  Agendamento,
  BookingConflictError,
  ConflictResponse,
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
