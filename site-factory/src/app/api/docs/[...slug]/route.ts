import { NextResponse } from "next/server";
import { readDoc, writeDoc } from "@/lib/docs";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const id = slug.join("/");
  const doc = await readDoc(id);
  if (!doc) {
    return NextResponse.json(
      { error: "Doc not found" },
      { status: 404 },
    );
  }
  return NextResponse.json(
    { doc },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  const id = slug.join("/");
  const body = (await req.json()) as { content?: string };

  if (typeof body.content !== "string") {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 },
    );
  }

  try {
    const doc = await writeDoc(id, body.content);
    return NextResponse.json(
      { doc },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Write failed";
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
