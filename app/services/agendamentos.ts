import { Agendamento, NovoAgendamentoPayload } from "@/app/types/agendamento";

export async function getAgendamentos(): Promise<Agendamento[]> {
  const res = await fetch("/api/agendamentos", {
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
): Promise<unknown> {
  const res = await fetch("/api/agendamentos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao registrar agendamentos.");
  }

  return await res.json();
}
