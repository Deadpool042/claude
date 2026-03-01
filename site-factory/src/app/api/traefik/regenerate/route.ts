import { NextResponse } from "next/server";
import { generateTraefikConfig } from "@/lib/generators/traefik";

export async function POST(): Promise<NextResponse> {
  try {
    await generateTraefikConfig();
    return NextResponse.json({
      success: true,
      message: "Traefik config regenerated",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
