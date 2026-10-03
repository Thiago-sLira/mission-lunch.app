export type Dupla = "ELDERES_1" | "ELDERES_2" | "SISTERES";

/** Resposta do POST quando há conflito de agendamento duplicado */
export interface ConflictResponse {
  status: "conflict";
  code: "DUPLICATE_BOOKING";
  conflitos: Dupla[];
  message: string;
}

/** Erro tipado lançado pela camada de serviço em caso de conflito */
export class BookingConflictError extends Error {
  readonly conflitos: Dupla[];
  constructor(conflitos: Dupla[], message: string) {
    super(message);
    this.name = "BookingConflictError";
    this.conflitos = conflitos;
  }
}

export interface Agendamento {
  id?: string;
  data: string; // formato "YYYY-MM-DD"
  dupla: Dupla;
  nome_familia: string;
  observacao?: string;
  criado_em?: string;
  data_desabilitada?: boolean | string;
}

export interface NovoAgendamentoPayload {
  data: string; // formato "YYYY-MM-DD"
  dupla: Dupla;
  nome_familia: string;
  observacao?: string;
  data_desabilitada?: boolean | string;
}

/**
 * Normaliza o valor de data_desabilitada vindo da planilha
 * (pode vir como booleano true, string "true", "TRUE", "1", etc.)
 */
export function isDataDesabilitada(
  valor?: boolean | string | null
): boolean {
  if (valor === true) return true;
  if (typeof valor === "string") {
    const limpo = valor.trim().toLowerCase();
    return limpo === "true" || limpo === "1" || limpo === "sim";
  }
  return false;
}

export const DUPLAS_CONFIG: {
  id: Dupla;
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  {
    id: "ELDERES_1",
    label: "Dupla Élderes 1",
    shortLabel: "Dupla Élderes 1",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  {
    id: "ELDERES_2",
    label: "Dupla Élderes 2",
    shortLabel: "Dupla Élderes 2",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-700",
  },
  {
    id: "SISTERES",
    label: "Dupla Sisteres",
    shortLabel: "Dupla Sisteres",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
  },
];
