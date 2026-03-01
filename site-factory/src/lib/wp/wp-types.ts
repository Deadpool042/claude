import type { DeployTarget } from "@/generated/prisma/client";

export type WpInfoDto = {
  deployTarget: DeployTarget | null;
  permalink: string;
  pages: unknown[];
  plugins: unknown[];
  themes: unknown[];
  siteUrl: string;
};

export type WpActionName =
  | "set-permalink"
  | "create-page"
  | "delete-page"
  | "install-plugin"
  | "toggle-plugin"
  | "delete-plugin"
  | "update-plugin"
  | "search-plugin"
  | "activate-theme"
  | "set-option"
  | "apply-preset"
  | "sync-mu-plugins"
  | "test-honeypot"
  | "maintenance-status"
  | "list-cron"
  | "run-health-check"
  | "run-backup"
  | "restore-backup";

export type WpActionRequest = {
  action: WpActionName;
  args?: Record<string, string | undefined>;
};
