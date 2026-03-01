import { z } from "zod";

const clientBaseSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne doit pas dépasser 100 caractères"),
  firstName: z
    .string()
    .max(100, "Le prénom ne doit pas dépasser 100 caractères")
    .optional()
    .transform((v) => v?.trim() || undefined),
  lastName: z
    .string()
    .max(100, "Le nom de famille ne doit pas dépasser 100 caractères")
    .optional()
    .transform((v) => v?.trim() || undefined),
  email: z
    .string()
    .email("Email invalide")
    .optional()
    .or(z.literal(""))
    .transform((v) => v?.trim() || undefined),
  phone: z
    .string()
    .max(30, "Le téléphone ne doit pas dépasser 30 caractères")
    .optional()
    .transform((v) => v?.trim() || undefined),
  notes: z
    .string()
    .max(5000, "Les notes ne doivent pas dépasser 5000 caractères")
    .optional()
    .transform((v) => v?.trim() || undefined),
});

export const createClientSchema = clientBaseSchema;

export type CreateClientInput = z.infer<typeof createClientSchema>;

export const updateClientSchema = clientBaseSchema;

export type UpdateClientInput = z.infer<typeof updateClientSchema>;
