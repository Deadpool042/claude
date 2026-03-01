import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export type ComposeFile = "docker-compose.local.yml" | "docker-compose.prod-like.yml" | "docker-compose.yml";

export type WpCliRunnerOpts = {
  cwd: string;
  composeFile: ComposeFile;
  service: string; // compose service name
  timeoutMs?: number;
};

export type WpExecResult = { stdout: string; stderr: string };

export class WpRuntimeUnavailableError extends Error {
  readonly code = "WP_RUNTIME_UNAVAILABLE";

  constructor(message: string) {
    super(message);
    this.name = "WpRuntimeUnavailableError";
  }
}

const ALLOWED_WP_PREFIXES = new Set<string>([
  // Read
  "option get",
  "post list",
  "plugin list",
  "theme list",

  // Write
  "rewrite structure",
  "rewrite flush",
  "post create",
  "post delete",
  "plugin install",
  "plugin activate",
  "plugin deactivate",
  "plugin delete",
  "plugin update",
  "plugin search",
  "theme activate",
  "theme install",
  "option update",
  "language core install",
  "site switch-language",
  "sf honeypot-test",
  "sf health-check",
  "sf backup",
  "sf restore",
  "sf maintenance-status",
  "cron event list",
]);

function prefix2(args: string[]): string {
  return `${args[0] ?? ""} ${args[1] ?? ""}`.trim();
}
function prefix3(args: string[]): string {
  return `${args[0] ?? ""} ${args[1] ?? ""} ${args[2] ?? ""}`.trim();
}

function ensureAllowed(wpArgs: string[]): void {
  if (wpArgs.length < 2) throw new Error("WP args invalides");
  const p3 = prefix3(wpArgs);
  const p2 = prefix2(wpArgs);
  if (ALLOWED_WP_PREFIXES.has(p3)) return;
  if (ALLOWED_WP_PREFIXES.has(p2)) return;
  throw new Error(`Commande WP non autorisée: ${p3 || p2}`);
}

/**
 * Exécute:
 * docker compose -f <composeFile> exec -T <service> wp <wpArgs...> --allow-root
 *
 * Sécurité:
 * - execFile (pas de shell)
 * - args séparés (pas d’injection via quotes)
 * - whitelist sur le préfixe WP
 */
export async function runWpCli(wpArgs: string[], opts: WpCliRunnerOpts): Promise<WpExecResult> {
  ensureAllowed(wpArgs);

  try {
    const statusArgs = [
      "compose",
      "-f",
      opts.composeFile,
      "ps",
      "-q",
      opts.service,
    ];
    const status = await execFileAsync("docker", statusArgs, {
      cwd: opts.cwd,
      timeout: 10_000,
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    });
    if (!status.stdout?.toString().trim()) {
      throw new WpRuntimeUnavailableError(
        `Service "${opts.service}" indisponible pour ${opts.composeFile}`,
      );
    }
  } catch (error) {
    if (error instanceof WpRuntimeUnavailableError) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : "Service indisponible";
    throw new WpRuntimeUnavailableError(message);
  }

  const dockerArgs = [
    "compose",
    "-f",
    opts.composeFile,
    "exec",
    "-T",
    opts.service,
    "wp",
    ...wpArgs,
    "--allow-root",
  ];

  const { stdout, stderr } = await execFileAsync("docker", dockerArgs, {
    cwd: opts.cwd,
    timeout: opts.timeoutMs ?? 30_000,
    windowsHide: true,
    maxBuffer: 10 * 1024 * 1024,
  });

  return {
    stdout: (stdout ?? "").toString().trim(),
    stderr: (stderr ?? "").toString().trim(),
  };
}
