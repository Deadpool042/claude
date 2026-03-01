import { NextResponse } from "next/server";
import { listDocs } from "@/lib/docs";

export const dynamic = "force-dynamic";

export async function GET() {
  const docs = await listDocs();
  return NextResponse.json(
    { docs },
    { headers: { "Cache-Control": "no-store" } },
  );
}
