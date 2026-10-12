import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  credenciaisValidas,
  criarTokenSessao,
} from "@/app/lib/adminSession";

const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MAX_LENGTH = 256;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.length < 1 ||
    email.length > EMAIL_MAX_LENGTH ||
    password.length < 1 ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  if (!credenciaisValidas(email, password)) {
    console.warn({ event: "admin_login_failed" });
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  let token: string;
  try {
    token = criarTokenSessao();
  } catch (error) {
    console.error({
      event: "admin_session_config_error",
      message: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ error: "Falha ao iniciar sessão." }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
