import { z } from "zod";

export const wpActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("set-permalink"),
    args: z.object({ structure: z.string().optional() }).optional(),
  }),
  z.object({
    action: z.literal("create-page"),
    args: z.object({ title: z.string().optional() }).optional(),
  }),
  z.object({
    action: z.literal("delete-page"),
    args: z.object({ pageId: z.string().min(1) }),
  }),
  z.object({
    action: z.literal("install-plugin"),
    args: z.object({ plugin: z.string().min(1) }),
  }),
  z.object({
    action: z.literal("toggle-plugin"),
    args: z.object({ plugin: z.string().min(1), activate: z.enum(["true", "false"]) }),
  }),
  z.object({
    action: z.literal("delete-plugin"),
    args: z.object({ plugin: z.string().min(1) }),
  }),
  z.object({
    action: z.literal("update-plugin"),
    args: z.object({ plugin: z.string().min(1) }),
  }),
  z.object({
    action: z.literal("search-plugin"),
    args: z.object({ search: z.string().min(1) }),
  }),
  z.object({
    action: z.literal("activate-theme"),
    args: z.object({ theme: z.string().min(1) }),
  }),
  z.object({
    action: z.literal("set-option"),
    args: z.object({ key: z.string().min(1), value: z.string() }),
  }),
  z.object({
    action: z.literal("apply-preset"),
    args: z.object({ preset: z.string().min(1) }),
  }),
  z.object({
    action: z.literal("sync-mu-plugins"),
  }),
  z.object({
    action: z.literal("test-honeypot"),
  }),
  z.object({
    action: z.literal("maintenance-status"),
  }),
  z.object({
    action: z.literal("list-cron"),
  }),
  z.object({
    action: z.literal("run-health-check"),
  }),
  z.object({
    action: z.literal("run-backup"),
    args: z
      .object({
        type: z.string().optional(),
        keep: z.string().optional(),
      })
      .optional(),
  }),
  z.object({
    action: z.literal("restore-backup"),
    args: z
      .object({
        type: z.string().optional(),
        db: z.string().optional(),
        uploads: z.string().optional(),
      })
      .optional(),
  }),
]);

export type ValidWpAction = z.infer<typeof wpActionSchema>;
