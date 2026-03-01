"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createClientSchema } from "@/lib/validators/client";
import { generateSlug } from "@/lib/slug";

interface ActionState {
  error: string | null;
}

export async function createClientAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    name: formData.get("name"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    notes: formData.get("notes"),
  };
  const parsed = createClientSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const slug = generateSlug(parsed.data.name);

  const existing = await prisma.client.findUnique({ where: { slug } });
  if (existing) {
    return { error: `Un client avec le slug "${slug}" existe déjà.` };
  }

  const client = await prisma.client.create({
    data: {
      name: parsed.data.name,
      slug,
      firstName: parsed.data.firstName ?? null,
      lastName: parsed.data.lastName ?? null,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      notes: parsed.data.notes ?? null,
    },
  });

  redirect(`/dashboard/clients/${client.id}`);
}
