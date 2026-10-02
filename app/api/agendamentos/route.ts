import { NextResponse } from "next/server";
import { Agendamento, NovoAgendamentoPayload } from "@/app/types/agendamento";

const GOOGLE_SCRIPT_URL =
  process.env.SHEETS_API_URL ||
  process.env.PUBLIC_SHEETS_API_URL ||
  "";

export async function GET() {
  if (!GOOGLE_SCRIPT_URL) {
    return NextResponse.json(
      { error: "SHEETS_API_URL não configurada no ambiente." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "GET",
      redirect: "follow",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta do Google Script: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return NextResponse.json(
      { error: "Falha ao carregar agendamentos da planilha." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!GOOGLE_SCRIPT_URL) {
    return NextResponse.json(
      { error: "SHEETS_API_URL não configurada no ambiente." },
      { status: 500 }
    );
  }

  try {
    const payload: NovoAgendamentoPayload[] = await request.json();

    if (!Array.isArray(payload) || payload.length === 0) {
      return NextResponse.json(
        { error: "Payload inválido. Espera-se um array de agendamentos." },
        { status: 400 }
      );
    }

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta do Google Script: ${response.statusText}`);
    }

    // Google Apps Script can return text or json depending on implementation
    let responseData;
    const responseText = await response.text();
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText || "Agendamentos criados com sucesso." };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Erro ao registrar agendamento:", error);
    return NextResponse.json(
      { error: "Falha ao registrar agendamentos na planilha." },
      { status: 500 }
    );
  }
}
