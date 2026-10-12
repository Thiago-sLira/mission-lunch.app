export async function adminLogin(
  email: string,
  password: string
): Promise<void> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao fazer login.");
  }
}

export async function adminLogout(): Promise<void> {
  const res = await fetch("/api/admin/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao encerrar sessão.");
  }
}

export async function getAdminSession(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/session", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return false;
    }

    const data = await res.json();
    return Boolean(data?.isAdmin);
  } catch {
    return false;
  }
}
