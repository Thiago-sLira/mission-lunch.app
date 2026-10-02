export type Dupla = "ELDERES_1" | "ELDERES_2" | "SISTERES";

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
    label: "Élderes 1",
    shortLabel: "Élderes 1",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  {
    id: "ELDERES_2",
    label: "Élderes 2",
    shortLabel: "Élderes 2",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-700",
  },
  {
    id: "SISTERES",
    label: "Sisteres",
    shortLabel: "Sisteres",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
  },
];
