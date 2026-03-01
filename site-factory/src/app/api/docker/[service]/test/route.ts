// src/app/api/docker/[service]/test/route.ts
import { NextResponse } from "next/server";

const SERVICE_TEST_URLS: Record<string, string> = {
  traefik: process.env.TRAEFIK_TEST_URL ?? "http://127.0.0.1:8080",
  whoami: process.env.WHOAMI_TEST_URL ?? "http://127.0.0.1:18080",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ service: string }> },
): Promise<NextResponse> {
  const { service } = await params;

  const url = SERVICE_TEST_URLS[service];
  if (!url) {
    return NextResponse.json(
      { success: false, error: `Unknown service: ${service}` },
      { status: 400 },
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 5000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    const body = await res.text();

    return NextResponse.json({
      success: true,
      status: res.status,
      url,
      body: body.slice(0, 2000),
    });
 } catch (error: unknown) {
  console.error("[docker-test]", error);
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  return NextResponse.json({ success: false, url, error: message }, { status: 502 });
}
}