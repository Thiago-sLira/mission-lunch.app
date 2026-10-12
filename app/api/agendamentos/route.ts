import { NextResponse } from "next/server";
import { isAdminRequest } from "@/app/lib/adminSession";
import { isDataDesabilitada, NovoAgendamentoPayload } from "@/app/types/agendamento";

const GOOGLE_SCRIPT_URL =
  process.env.SHEETS_API_URL ||
  process.env.PUBLIC_SHEETS_API_URL ||
  "";

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const DATA_RE = /^\d{4}-\d{2}-\d{2}$/;
const DUPLA_RE = /^(ELDERES|SISTERES)_\d{1,3}$/;
const TIPOS_VALIDOS = new Set(["ELDER", "SISTER"]);

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function validarNumero(v: unknown): number | null {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 999 ? n : null;
}

// ---------------------------------------------------------------------------
// Upstream response helper — text-or-JSON, same as before
// ---------------------------------------------------------------------------

async function lerRespostaUpstream(response: Response): Promise<unknown> {
  const texto = await response.text();
  try {
    return JSON.parse(texto);
  } catch {
    return { message: texto || "Operação concluída." };
  }
}

// ---------------------------------------------------------------------------
// GET /api/agendamentos?action=agendamentos|missionarios
// ---------------------------------------------------------------------------

const GET_ALLOWLIST = new Set(["agendamentos", "missionarios"]);

export async function GET(request: Request) {
  if (!GOOGLE_SCRIPT_URL) {
    return NextResponse.json(
      { error: "SHEETS_API_URL não configurada no ambiente." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  // O doGet do Apps Script exige ?action= — padrão: agendamentos
  const action = searchParams.get("action") ?? "agendamentos";

  if (!GET_ALLOWLIST.has(action)) {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }

  const upstreamUrl = new URL(GOOGLE_SCRIPT_URL);
  upstreamUrl.searchParams.set("action", action);

  const errorMessage =
    action === "missionarios"
      ? "Falha ao carregar missionários."
      : "Falha ao carregar agendamentos da planilha.";

  try {
    const response = await fetch(upstreamUrl.toString(), {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Resposta upstream: ${response.status} ${response.statusText}`);
    }

    const data = await lerRespostaUpstream(response);
    if (!Array.isArray(data)) {
      // Apps Script respondeu com erro (ex: { status: "error" }) em vez de lista
      throw new Error("Resposta upstream não é uma lista.");
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error({ msg: "GET /api/agendamentos falhou", action, error });
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/agendamentos  { action, ... }
// ---------------------------------------------------------------------------

const POST_ALLOWLIST = new Set(["agendar", "salvar_dupla", "excluir_dupla"]);

export async function POST(request: Request) {
  if (!GOOGLE_SCRIPT_URL) {
    return NextResponse.json(
      { error: "SHEETS_API_URL não configurada no ambiente." },
      { status: 500 }
    );
  }

  // --- parse body ---
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const { action } = body;
  if (typeof action !== "string" || !POST_ALLOWLIST.has(action)) {
    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  }

  // --- per-action validation ---
  let forwardPayload: unknown;

  if (action === "agendar") {
    const data = body.data;
    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "O campo 'data' deve ser um array não vazio." },
        { status: 400 }
      );
    }

    const itens: NovoAgendamentoPayload[] = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (typeof item !== "object" || item === null) {
        return NextResponse.json({ error: `Item ${i}: objeto inválido.` }, { status: 400 });
      }
      const { data: dataItem, dupla, nome_familia, observacao, data_desabilitada } = item as Record<string, unknown>;

      if (typeof dataItem !== "string" || !DATA_RE.test(dataItem)) {
        return NextResponse.json(
          { error: `Item ${i}: 'data' deve estar no formato YYYY-MM-DD.` },
          { status: 400 }
        );
      }
      if (typeof dupla !== "string" || !DUPLA_RE.test(dupla)) {
        return NextResponse.json(
          { error: `Item ${i}: 'dupla' inválida.` },
          { status: 400 }
        );
      }
      if (!isNonEmptyString(nome_familia) || (nome_familia as string).length > 120) {
        return NextResponse.json(
          { error: `Item ${i}: 'nome_familia' inválido (máx. 120 caracteres).` },
          { status: 400 }
        );
      }
      if (observacao !== undefined && observacao !== null) {
        if (typeof observacao !== "string" || observacao.length > 500) {
          return NextResponse.json(
            { error: `Item ${i}: 'observacao' inválida (máx. 500 caracteres).` },
            { status: 400 }
          );
        }
      }
      itens.push({ data: dataItem, dupla, nome_familia, observacao: observacao as string | undefined, data_desabilitada: data_desabilitada as boolean | string | undefined });
    }

    // Admin check for blocked dates
    const temDesabilitada = itens.some((item) => isDataDesabilitada(item.data_desabilitada));
    if (temDesabilitada) {
      const ok = await isAdminRequest();
      if (!ok) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }
    }

    forwardPayload = { action: "agendar", data: itens };

  } else if (action === "salvar_dupla") {
    const ok = await isAdminRequest();
    if (!ok) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { tipo, numero_dupla, nomes } = body;

    if (!TIPOS_VALIDOS.has(tipo as string)) {
      return NextResponse.json(
        { error: "'tipo' deve ser ELDER ou SISTER." },
        { status: 400 }
      );
    }
    const numero = validarNumero(numero_dupla);
    if (numero === null) {
      return NextResponse.json(
        { error: "'numero_dupla' deve ser um inteiro entre 1 e 999." },
        { status: 400 }
      );
    }
    if (!Array.isArray(nomes) || nomes.length < 2 || nomes.length > 10) {
      return NextResponse.json(
        { error: "'nomes' deve ser um array de 2 a 10 elementos." },
        { status: 400 }
      );
    }
    const nomesTrimados: string[] = [];
    for (let i = 0; i < nomes.length; i++) {
      if (typeof nomes[i] !== "string") {
        return NextResponse.json({ error: `'nomes[${i}]' deve ser uma string.` }, { status: 400 });
      }
      const trimado = (nomes[i] as string).trim();
      if (!trimado || trimado.length > 80) {
        return NextResponse.json(
          { error: `'nomes[${i}]' inválido (não vazio, máx. 80 caracteres).` },
          { status: 400 }
        );
      }
      nomesTrimados.push(trimado);
    }

    forwardPayload = { action, numero_dupla: numero, tipo, nomes: nomesTrimados };

  } else {
    // excluir_dupla
    const ok = await isAdminRequest();
    if (!ok) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { tipo, numero_dupla } = body;

    if (!TIPOS_VALIDOS.has(tipo as string)) {
      return NextResponse.json(
        { error: "'tipo' deve ser ELDER ou SISTER." },
        { status: 400 }
      );
    }
    const numero = validarNumero(numero_dupla);
    if (numero === null) {
      return NextResponse.json(
        { error: "'numero_dupla' deve ser um inteiro entre 1 e 999." },
        { status: 400 }
      );
    }

    forwardPayload = { action, numero_dupla: numero, tipo };
  }

  // --- forward to Apps Script ---
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forwardPayload),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Resposta upstream: ${response.status} ${response.statusText}`);
    }

    const responseData = await lerRespostaUpstream(response);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error({ msg: "POST /api/agendamentos falhou", action, error });
    return NextResponse.json(
      { error: "Falha ao processar a requisição." },
      { status: 500 }
    );
  }
}
