"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateClientSchema } from "@/lib/validators";
import { generateSlug } from "@/lib/slug";

interface ActionState {
  error: string | null;
}

export async function updateClientAction(
  clientId: string,
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
  const parsed = updateClientSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Données invalides" };
  }

  const existing = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!existing) {
    return { error: "Client introuvable." };
  }

  const newSlug = generateSlug(parsed.data.name);

  // Check slug uniqueness only if it changed
  if (newSlug !== existing.slug) {
    const slugTaken = await prisma.client.findUnique({
      where: { slug: newSlug },
    });
    if (slugTaken) {
      return { error: `Un client avec le slug "${newSlug}" existe déjà.` };
    }
  }

  await prisma.client.update({
    where: { id: clientId },
    data: {
      name: parsed.data.name,
      slug: newSlug,
      firstName: parsed.data.firstName ?? null,
      lastName: parsed.data.lastName ?? null,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      notes: parsed.data.notes ?? null,
    },
  });

  redirect(`/dashboard/clients/${clientId}`);
}
