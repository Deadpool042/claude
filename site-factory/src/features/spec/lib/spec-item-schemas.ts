import { z } from "zod";
import { featuresSpecSchema, modulesSpecSchema } from "@/lib/referential/spec/schema";

export const featureItemSchema = featuresSpecSchema.shape.features.element;
export const moduleItemSchema = modulesSpecSchema.shape.modules.element;

export type FeatureItemInput = z.infer<typeof featureItemSchema>;
export type ModuleItemInput = z.infer<typeof moduleItemSchema>;
