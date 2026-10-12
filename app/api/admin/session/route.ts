import { NextResponse } from "next/server";
import { isAdminRequest } from "@/app/lib/adminSession";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAdmin = await isAdminRequest();
  return NextResponse.json(
    { isAdmin },
    { headers: { "Cache-Control": "no-store" } }
  );
}
