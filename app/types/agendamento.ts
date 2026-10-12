/** ID dinâmico de dupla, derivado da planilha (ex: "ELDERES_1", "SISTERES_2") */
export type Dupla = string;

/** Tipo de missionário */
export type TipoMissionario = "ELDER" | "SISTER";

/** Missionário individual conforme retornado pela planilha */
export interface Missionario {
  "Numero Dupla": number;
  Tipo: TipoMissionario;
  Nome: string;
}

/** Dupla agrupada com todos os dados necessários para exibição */
export interface DuplaInfo {
  id: Dupla;
  tipo: TipoMissionario;
  numero: number;
  nomes: string[];
  label: string;
  shortLabel: string;
  badgeBg: string;
  badgeText: string;
}

/** Payload para salvar (criar ou editar) uma dupla */
export interface SalvarDuplaPayload {
  tipo: TipoMissionario;
  numero_dupla: number;
  nomes: string[];
}

/** Payload para excluir uma dupla */
export interface ExcluirDuplaPayload {
  tipo: TipoMissionario;
  numero_dupla: number;
}

/** Erro genérico retornado pela API (ex: DUPLICATE_NAME) */
export interface ApiErrorResponse {
  status: "error";
  code: string;
  message: string;
}

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

/** Erro retornado por ações de API (ex: DUPLICATE_NAME, UNAUTHORIZED) */
export class ApiActionError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiActionError";
    this.code = code;
  }
}

/** Agendamento retornado pela planilha (sem id — use `${data}-${dupla}` como chave) */
export interface Agendamento {
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

// ---------------------------------------------------------------------------
// Paleta de badges — classes Tailwind literais para detecção estática
// ---------------------------------------------------------------------------
const PALETA_BADGES: { badgeBg: string; badgeText: string }[] = [
  { badgeBg: "bg-blue-100",    badgeText: "text-blue-700" },
  { badgeBg: "bg-indigo-100",  badgeText: "text-indigo-700" },
  { badgeBg: "bg-emerald-100", badgeText: "text-emerald-800" },
  { badgeBg: "bg-violet-100",  badgeText: "text-violet-700" },
  { badgeBg: "bg-sky-100",     badgeText: "text-sky-700" },
  { badgeBg: "bg-teal-100",    badgeText: "text-teal-700" },
  { badgeBg: "bg-amber-100",   badgeText: "text-amber-700" },
  { badgeBg: "bg-rose-100",    badgeText: "text-rose-700" },
];

/**
 * Gera o ID canônico de uma dupla a partir de tipo e número.
 * ELDER 1 → "ELDERES_1", SISTER 2 → "SISTERES_2"
 */
export function gerarDuplaId(tipo: TipoMissionario, numero: number): Dupla {
  const prefixo = tipo === "ELDER" ? "ELDERES" : "SISTERES";
  return `${prefixo}_${numero}`;
}

/**
 * Agrupa uma lista de missionários em duplas ordenadas (ELDER primeiro, depois por número).
 * Nomes vazios são ignorados e os demais são trimados.
 */
export function agruparDuplas(missionarios: Missionario[]): DuplaInfo[] {
  // Mapa: "ELDER_1" → { tipo, numero, nomes[] }
  const mapa = new Map<string, { tipo: TipoMissionario; numero: number; nomes: string[] }>();

  for (const m of missionarios) {
    // Chaves exatas das colunas da planilha: "Numero Dupla", "Tipo", "Nome"
    const tipoBruto = String(m?.Tipo ?? "").trim().toUpperCase();
    const numero = Number(m?.["Numero Dupla"]);
    const nome = String(m?.Nome ?? "").trim();

    if (tipoBruto !== "ELDER" && tipoBruto !== "SISTER") continue;
    if (!Number.isInteger(numero) || numero < 1) continue;
    const tipo: TipoMissionario = tipoBruto;

    const chave = `${tipo}_${numero}`;
    if (!mapa.has(chave)) {
      mapa.set(chave, { tipo, numero, nomes: [] });
    }

    if (nome) {
      mapa.get(chave)!.nomes.push(nome);
    }
  }

  // Ordena: ELDER antes de SISTER, depois por número crescente
  const entradas = Array.from(mapa.values()).sort((a, b) => {
    if (a.tipo !== b.tipo) {
      return a.tipo === "ELDER" ? -1 : 1;
    }
    return a.numero - b.numero;
  });

  return entradas.map((entrada, indice) => {
    const badge = PALETA_BADGES[indice % PALETA_BADGES.length];
    const id = gerarDuplaId(entrada.tipo, entrada.numero);
    const prefixoLabel = entrada.tipo === "ELDER" ? "Élderes" : "Sisteres";
    const label = `Dupla ${prefixoLabel} ${entrada.numero}`;

    return {
      id,
      tipo: entrada.tipo,
      numero: entrada.numero,
      nomes: entrada.nomes,
      label,
      shortLabel: label,
      badgeBg: badge.badgeBg,
      badgeText: badge.badgeText,
    };
  });
}
