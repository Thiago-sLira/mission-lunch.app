// SERVER-ONLY MODULE: never import this file from a Client Component.
// It reads secrets from process.env (ADMIN_EMAIL, ADMIN_PASSWORD,
// ADMIN_SESSION_SECRET). The "server-only" package is not installed in this
// project, so this comment documents the restriction instead.
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 1 * 60 * 60;

const MIN_SECRET_LENGTH = 32;

function obterSegredo(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    return null;
  }
  return secret;
}

function assinar(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function sha256(valor: string): Buffer {
  return createHash("sha256").update(valor).digest();
}

export function criarTokenSessao(): string {
  const secret = obterSegredo();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET ausente ou menor que 32 caracteres.");
  }

  const expiraEmMs = String(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  return `${expiraEmMs}.${assinar(expiraEmMs, secret)}`;
}

export function verificarTokenSessao(token?: string): boolean {
  const secret = obterSegredo();
  if (!secret || !token) {
    return false;
  }

  const partes = token.split(".");
  if (partes.length !== 2) {
    return false;
  }

  const [expiraEmMs, assinatura] = partes;
  if (!/^\d+$/.test(expiraEmMs)) {
    return false;
  }

  const esperada = Buffer.from(assinar(expiraEmMs, secret), "utf8");
  const recebida = Buffer.from(assinatura, "utf8");
  if (esperada.length !== recebida.length) {
    return false;
  }

  if (!timingSafeEqual(esperada, recebida)) {
    return false;
  }

  return Number(expiraEmMs) > Date.now();
}

export function credenciaisValidas(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    return false;
  }

  const emailOk = timingSafeEqual(
    sha256(email.trim().toLowerCase()),
    sha256(adminEmail.trim().toLowerCase())
  );
  const senhaOk = timingSafeEqual(sha256(password), sha256(adminPassword));

  return emailOk && senhaOk;
}

export async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  return verificarTokenSessao(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}
