import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {
  PrismaClient,
  type ProjectType,
  type TaxonomyDisambiguationSignal,
} from "../src/generated/prisma/client";
import {
  normalizeTaxonomySignalForProjectType,
  readPersistedTaxonomySignalFromCiAxesJson,
} from "../src/lib/taxonomy";

type Mode = "backfill" | "rollback";

interface CandidateRow {
  projectId: string;
  projectName: string;
  signal: TaxonomyDisambiguationSignal;
}

interface BackfillAuditSummary {
  totalQualifications: number;
  rowsAlreadyPopulated: number;
  rowsWithoutDedicatedSignal: number;
  backfillRecoverableViaCiAxesJson: number;
  ambiguousOrMissing: number;
  fallbackIncompatibleWithProjectType: number;
  outOfScopeWithoutSignal: number;
  dedicatedIncompatibleWithProjectType: number;
  dedicatedCiAxesMismatch: number;
  dedicatedWithoutCiAxesEnvelope: number;
}

type AuditIssueReason =
  | "missing_or_ambiguous_fallback"
  | "fallback_incompatible_with_project_type"
  | "dedicated_mismatch_with_ci_axes"
  | "dedicated_incompatible_with_project_type"
  | "dedicated_without_ci_axes_envelope";

interface AuditIssueRow {
  projectId: string;
  projectName: string;
  projectType: ProjectType;
  dedicatedSignal: TaxonomyDisambiguationSignal | null;
  ciAxesSignal: TaxonomyDisambiguationSignal | null;
  reason: AuditIssueReason;
}

interface BackfillCollection {
  candidates: CandidateRow[];
  summary: BackfillAuditSummary;
  issueSamples: AuditIssueRow[];
}

interface CliOptions {
  mode: Mode;
  applyRequested: boolean;
  apply: boolean;
  outputJson: boolean;
  statsOnly: boolean;
}

interface CandidatePreview {
  total: number;
  sample: CandidateRow[];
  omitted: number;
}

interface BackfillSummaryReport {
  totalQualifications: number;
  alreadyPopulated: number;
  concernedNull: number;
  recoverableViaCiAxesJson: number;
  ambiguousOrMissing: number;
  incompatible: number;
  outOfScope: number;
  inconsistentDedicatedVsEnvelope: number;
  dedicatedIncompatibleWithProjectType: number;
  dedicatedWithoutCiAxesEnvelope: number;
}

interface AuditIssueReasonBreakdown {
  missing_or_ambiguous_fallback: number;
  fallback_incompatible_with_project_type: number;
  dedicated_mismatch_with_ci_axes: number;
  dedicated_incompatible_with_project_type: number;
  dedicated_without_ci_axes_envelope: number;
}

interface ExecutionReport {
  applyRequested: boolean;
  applied: boolean;
  dryRun: boolean;
  statsOnly: boolean;
  updatedRows: number;
  message: string;
}

interface BackfillJsonReport {
  reportVersion: 1;
  generatedAt: string;
  mode: "backfill";
  summary: BackfillSummaryReport;
  candidates: CandidatePreview;
  anomalies: {
    total: number;
    byReason: AuditIssueReasonBreakdown;
    sample: AuditIssueRow[];
    omitted: number;
  };
  execution: ExecutionReport;
}

interface RollbackJsonReport {
  reportVersion: 1;
  generatedAt: string;
  mode: "rollback";
  candidates: CandidatePreview;
  execution: ExecutionReport;
}

type JsonReport = BackfillJsonReport | RollbackJsonReport;

const CANDIDATE_PREVIEW_LIMIT = 25;
const ISSUE_PREVIEW_LIMIT = 25;
const ISSUE_STORE_LIMIT = 250;

const adapter = new PrismaMariaDb(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

function getMode(args: readonly string[]): Mode {
  return args.includes("--rollback") ? "rollback" : "backfill";
}

function isApply(args: readonly string[]): boolean {
  return args.includes("--apply");
}

function isJsonOutput(args: readonly string[]): boolean {
  return args.includes("--json");
}

function isStatsOnly(args: readonly string[]): boolean {
  return args.includes("--stats-only");
}

function parseCliOptions(args: readonly string[]): CliOptions {
  const mode = getMode(args);
  const applyRequested = isApply(args);
  const statsOnly = isStatsOnly(args);

  return {
    mode,
    applyRequested,
    apply: applyRequested && !statsOnly,
    outputJson: isJsonOutput(args),
    statsOnly,
  };
}

function printUsage(): void {
  console.log("Usage:");
  console.log("  pnpm sf:backfill-taxonomy-signal");
  console.log("  pnpm sf:backfill-taxonomy-signal --apply");
  console.log("  pnpm sf:backfill-taxonomy-signal --stats-only");
  console.log("  pnpm sf:backfill-taxonomy-signal --json");
  console.log("  pnpm sf:backfill-taxonomy-signal --stats-only --json");
  console.log("  pnpm sf:backfill-taxonomy-signal --rollback");
  console.log("  pnpm sf:backfill-taxonomy-signal --rollback --apply");
  console.log("  pnpm sf:backfill-taxonomy-signal --rollback --json");
}

function isSignalProjectType(projectType: ProjectType): boolean {
  return projectType === "VITRINE" || projectType === "BLOG" || projectType === "APP";
}

function buildInitialSummary(): BackfillAuditSummary {
  return {
    totalQualifications: 0,
    rowsAlreadyPopulated: 0,
    rowsWithoutDedicatedSignal: 0,
    backfillRecoverableViaCiAxesJson: 0,
    ambiguousOrMissing: 0,
    fallbackIncompatibleWithProjectType: 0,
    outOfScopeWithoutSignal: 0,
    dedicatedIncompatibleWithProjectType: 0,
    dedicatedCiAxesMismatch: 0,
    dedicatedWithoutCiAxesEnvelope: 0,
  };
}

function pushIssue(
  issueSamples: AuditIssueRow[],
  issue: AuditIssueRow,
): void {
  if (issueSamples.length >= ISSUE_STORE_LIMIT) {
    return;
  }
  issueSamples.push(issue);
}

async function collectBackfillCandidates(): Promise<BackfillCollection> {
  const rows = await prisma.projectQualification.findMany({
    select: {
      projectId: true,
      taxonomySignal: true,
      ciAxesJson: true,
      project: {
        select: {
          name: true,
          type: true,
        },
      },
    },
  });

  const candidates: CandidateRow[] = [];
  const summary = buildInitialSummary();
  const issueSamples: AuditIssueRow[] = [];

  for (const row of rows) {
    summary.totalQualifications += 1;

    const ciAxesSignal = readPersistedTaxonomySignalFromCiAxesJson(row.ciAxesJson);
    const fallbackSignal = normalizeTaxonomySignalForProjectType(
      row.project.type,
      ciAxesSignal,
    );

    if (row.taxonomySignal) {
      summary.rowsAlreadyPopulated += 1;

      const normalizedDedicated = normalizeTaxonomySignalForProjectType(
        row.project.type,
        row.taxonomySignal,
      );

      if (!normalizedDedicated) {
        summary.dedicatedIncompatibleWithProjectType += 1;
        pushIssue(issueSamples, {
          projectId: row.projectId,
          projectName: row.project.name,
          projectType: row.project.type,
          dedicatedSignal: row.taxonomySignal,
          ciAxesSignal,
          reason: "dedicated_incompatible_with_project_type",
        });
      }

      if (!ciAxesSignal) {
        summary.dedicatedWithoutCiAxesEnvelope += 1;
        pushIssue(issueSamples, {
          projectId: row.projectId,
          projectName: row.project.name,
          projectType: row.project.type,
          dedicatedSignal: row.taxonomySignal,
          ciAxesSignal,
          reason: "dedicated_without_ci_axes_envelope",
        });
      } else if (ciAxesSignal !== row.taxonomySignal) {
        summary.dedicatedCiAxesMismatch += 1;
        pushIssue(issueSamples, {
          projectId: row.projectId,
          projectName: row.project.name,
          projectType: row.project.type,
          dedicatedSignal: row.taxonomySignal,
          ciAxesSignal,
          reason: "dedicated_mismatch_with_ci_axes",
        });
      }

      continue;
    }

    summary.rowsWithoutDedicatedSignal += 1;

    if (!fallbackSignal) {
      if (ciAxesSignal) {
        summary.fallbackIncompatibleWithProjectType += 1;
        pushIssue(issueSamples, {
          projectId: row.projectId,
          projectName: row.project.name,
          projectType: row.project.type,
          dedicatedSignal: null,
          ciAxesSignal,
          reason: "fallback_incompatible_with_project_type",
        });
        continue;
      }

      if (isSignalProjectType(row.project.type)) {
        summary.ambiguousOrMissing += 1;
        pushIssue(issueSamples, {
          projectId: row.projectId,
          projectName: row.project.name,
          projectType: row.project.type,
          dedicatedSignal: null,
          ciAxesSignal: null,
          reason: "missing_or_ambiguous_fallback",
        });
      } else {
        summary.outOfScopeWithoutSignal += 1;
      }
      continue;
    }

    summary.backfillRecoverableViaCiAxesJson += 1;
    candidates.push({
      projectId: row.projectId,
      projectName: row.project.name,
      signal: fallbackSignal,
    });
  }

  return { candidates, summary, issueSamples };
}

async function collectRollbackCandidates(): Promise<CandidateRow[]> {
  const rows = await prisma.projectQualification.findMany({
    where: {
      NOT: {
        taxonomySignal: null,
      },
    },
    select: {
      projectId: true,
      taxonomySignal: true,
      ciAxesJson: true,
      project: {
        select: {
          name: true,
          type: true,
        },
      },
    },
  });

  const candidates: CandidateRow[] = [];

  for (const row of rows) {
    const currentSignal = row.taxonomySignal;
    if (!currentSignal) {
      continue;
    }

    const fallbackSignal = normalizeTaxonomySignalForProjectType(
      row.project.type,
      readPersistedTaxonomySignalFromCiAxesJson(row.ciAxesJson),
    );

    // Only rollback rows that still mirror the fallback envelope value.
    if (!fallbackSignal || fallbackSignal !== currentSignal) {
      continue;
    }

    candidates.push({
      projectId: row.projectId,
      projectName: row.project.name,
      signal: currentSignal,
    });
  }

  return candidates;
}

function printCandidates(mode: Mode, candidates: readonly CandidateRow[]): void {
  if (candidates.length === 0) {
    console.log(
      mode === "backfill"
        ? "No rows eligible for taxonomy_signal backfill."
        : "No rows eligible for taxonomy_signal rollback.",
    );
    return;
  }

  const actionLabel = mode === "backfill" ? "Backfill candidates" : "Rollback candidates";
  console.log(`${actionLabel}: ${String(candidates.length)}`);

  const preview = candidates.slice(0, CANDIDATE_PREVIEW_LIMIT);
  for (const candidate of preview) {
    console.log(
      `- ${candidate.projectName} (${candidate.projectId}) => ${candidate.signal}`,
    );
  }

  if (candidates.length > preview.length) {
    console.log(
      `... ${String(candidates.length - preview.length)} additional candidate(s) omitted.`,
    );
  }
}

function printCandidateCountOnly(mode: Mode, candidates: readonly CandidateRow[]): void {
  const actionLabel =
    mode === "backfill" ? "Backfill candidates (count only)" : "Rollback candidates (count only)";
  console.log(`${actionLabel}: ${String(candidates.length)}`);
}

function printBackfillSummary(summary: BackfillAuditSummary): void {
  console.log("Backfill audit summary:");
  console.log(`- total qualifications: ${String(summary.totalQualifications)}`);
  console.log(`- rows already populated (taxonomy_signal): ${String(summary.rowsAlreadyPopulated)}`);
  console.log(
    `- rows concerned (taxonomy_signal is null): ${String(summary.rowsWithoutDedicatedSignal)}`,
  );
  console.log(
    `- recoverable via ciAxesJson fallback: ${String(summary.backfillRecoverableViaCiAxesJson)}`,
  );
  console.log(
    `- ambiguous or missing fallback (in-scope types): ${String(summary.ambiguousOrMissing)}`,
  );
  console.log(
    `- incompatible fallback vs project type: ${String(summary.fallbackIncompatibleWithProjectType)}`,
  );
  console.log(
    `- out-of-scope rows without signal (STARTER/ECOM): ${String(summary.outOfScopeWithoutSignal)}`,
  );
  console.log(
    `- incoherent dedicated vs ciAxesJson envelope: ${String(summary.dedicatedCiAxesMismatch)}`,
  );
  console.log(
    `- incompatible dedicated signal vs project type: ${String(summary.dedicatedIncompatibleWithProjectType)}`,
  );
  console.log(
    `- dedicated signal without ciAxesJson envelope: ${String(summary.dedicatedWithoutCiAxesEnvelope)}`,
  );
}

function formatIssueReason(reason: AuditIssueReason): string {
  switch (reason) {
    case "missing_or_ambiguous_fallback":
      return "missing-or-ambiguous-fallback";
    case "fallback_incompatible_with_project_type":
      return "fallback-incompatible-with-project-type";
    case "dedicated_mismatch_with_ci_axes":
      return "dedicated-vs-ciAxes-mismatch";
    case "dedicated_incompatible_with_project_type":
      return "dedicated-incompatible-with-project-type";
    case "dedicated_without_ci_axes_envelope":
      return "dedicated-without-ciAxes-envelope";
  }
}

function printIssueSamples(issueSamples: readonly AuditIssueRow[]): void {
  if (issueSamples.length === 0) {
    return;
  }

  const preview = issueSamples.slice(0, ISSUE_PREVIEW_LIMIT);
  console.log(`Audit issue samples: ${String(issueSamples.length)}`);

  for (const issue of preview) {
    console.log(
      `- ${issue.projectName} (${issue.projectId}) [${issue.projectType}] reason=${formatIssueReason(issue.reason)} dedicated=${issue.dedicatedSignal ?? "null"} ciAxes=${issue.ciAxesSignal ?? "null"}`,
    );
  }

  if (issueSamples.length > preview.length) {
    console.log(
      `... ${String(issueSamples.length - preview.length)} additional issue sample(s) omitted.`,
    );
  }
}

function buildCandidatePreview(candidates: readonly CandidateRow[]): CandidatePreview {
  const sample = candidates.slice(0, CANDIDATE_PREVIEW_LIMIT);
  return {
    total: candidates.length,
    sample,
    omitted: Math.max(candidates.length - sample.length, 0),
  };
}

function countBackfillIssueTotal(summary: BackfillAuditSummary): number {
  return (
    summary.ambiguousOrMissing
    + summary.fallbackIncompatibleWithProjectType
    + summary.dedicatedCiAxesMismatch
    + summary.dedicatedIncompatibleWithProjectType
    + summary.dedicatedWithoutCiAxesEnvelope
  );
}

function buildIssueReasonBreakdown(
  summary: BackfillAuditSummary,
): AuditIssueReasonBreakdown {
  return {
    missing_or_ambiguous_fallback: summary.ambiguousOrMissing,
    fallback_incompatible_with_project_type: summary.fallbackIncompatibleWithProjectType,
    dedicated_mismatch_with_ci_axes: summary.dedicatedCiAxesMismatch,
    dedicated_incompatible_with_project_type: summary.dedicatedIncompatibleWithProjectType,
    dedicated_without_ci_axes_envelope: summary.dedicatedWithoutCiAxesEnvelope,
  };
}

function buildBackfillSummaryReport(summary: BackfillAuditSummary): BackfillSummaryReport {
  return {
    totalQualifications: summary.totalQualifications,
    alreadyPopulated: summary.rowsAlreadyPopulated,
    concernedNull: summary.rowsWithoutDedicatedSignal,
    recoverableViaCiAxesJson: summary.backfillRecoverableViaCiAxesJson,
    ambiguousOrMissing: summary.ambiguousOrMissing,
    incompatible: summary.fallbackIncompatibleWithProjectType,
    outOfScope: summary.outOfScopeWithoutSignal,
    inconsistentDedicatedVsEnvelope: summary.dedicatedCiAxesMismatch,
    dedicatedIncompatibleWithProjectType: summary.dedicatedIncompatibleWithProjectType,
    dedicatedWithoutCiAxesEnvelope: summary.dedicatedWithoutCiAxesEnvelope,
  };
}

function buildExecutionMessage(
  mode: Mode,
  options: CliOptions,
  updatedRows: number,
): string {
  if (options.statsOnly) {
    if (options.applyRequested) {
      return "Stats-only mode enabled. --apply ignored, no write attempted.";
    }
    return "Stats-only mode enabled. No write attempted.";
  }

  if (!options.applyRequested) {
    return "Dry run only. Re-run with --apply to persist changes.";
  }

  return mode === "backfill"
    ? `Backfill complete: ${String(updatedRows)} row(s) updated.`
    : `Rollback complete: ${String(updatedRows)} row(s) updated.`;
}

function buildExecutionReport(
  mode: Mode,
  options: CliOptions,
  updatedRows: number,
): ExecutionReport {
  return {
    applyRequested: options.applyRequested,
    applied: options.apply,
    dryRun: !options.apply,
    statsOnly: options.statsOnly,
    updatedRows,
    message: buildExecutionMessage(mode, options, updatedRows),
  };
}

function buildBackfillJsonReport(
  generatedAt: string,
  collection: BackfillCollection,
  execution: ExecutionReport,
): BackfillJsonReport {
  const issueSample = collection.issueSamples.slice(0, ISSUE_PREVIEW_LIMIT);
  const totalIssues = countBackfillIssueTotal(collection.summary);

  return {
    reportVersion: 1,
    generatedAt,
    mode: "backfill",
    summary: buildBackfillSummaryReport(collection.summary),
    candidates: buildCandidatePreview(collection.candidates),
    anomalies: {
      total: totalIssues,
      byReason: buildIssueReasonBreakdown(collection.summary),
      sample: issueSample,
      omitted: Math.max(totalIssues - issueSample.length, 0),
    },
    execution,
  };
}

function buildRollbackJsonReport(
  generatedAt: string,
  candidates: readonly CandidateRow[],
  execution: ExecutionReport,
): RollbackJsonReport {
  return {
    reportVersion: 1,
    generatedAt,
    mode: "rollback",
    candidates: buildCandidatePreview(candidates),
    execution,
  };
}

function printJsonReport(report: JsonReport): void {
  console.log(JSON.stringify(report, null, 2));
}

async function applyBackfill(candidates: readonly CandidateRow[]): Promise<number> {
  let updatedCount = 0;

  for (const candidate of candidates) {
    const result = await prisma.projectQualification.updateMany({
      where: {
        projectId: candidate.projectId,
        taxonomySignal: null,
      },
      data: {
        taxonomySignal: candidate.signal,
      },
    });

    updatedCount += result.count;
  }

  return updatedCount;
}

async function applyRollback(candidates: readonly CandidateRow[]): Promise<number> {
  let updatedCount = 0;

  for (const candidate of candidates) {
    const result = await prisma.projectQualification.updateMany({
      where: {
        projectId: candidate.projectId,
        taxonomySignal: candidate.signal,
      },
      data: {
        taxonomySignal: null,
      },
    });

    updatedCount += result.count;
  }

  return updatedCount;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    return;
  }

  const options = parseCliOptions(args);
  const generatedAt = new Date().toISOString();

  if (options.mode === "backfill") {
    const collection = await collectBackfillCandidates();

    if (!options.outputJson) {
      printBackfillSummary(collection.summary);
      if (options.statsOnly) {
        printCandidateCountOnly(options.mode, collection.candidates);
      } else {
        printCandidates(options.mode, collection.candidates);
      }
      printIssueSamples(collection.issueSamples);
    }

    const updatedCount = options.apply
      ? await applyBackfill(collection.candidates)
      : 0;
    const execution = buildExecutionReport(options.mode, options, updatedCount);

    if (options.outputJson) {
      printJsonReport(buildBackfillJsonReport(generatedAt, collection, execution));
      return;
    }

    console.log(execution.message);
    return;
  }

  const rollbackCandidates = await collectRollbackCandidates();
  if (!options.outputJson) {
    if (options.statsOnly) {
      printCandidateCountOnly(options.mode, rollbackCandidates);
    } else {
      printCandidates(options.mode, rollbackCandidates);
    }
  }

  const updatedCount = options.apply
    ? await applyRollback(rollbackCandidates)
    : 0;
  const execution = buildExecutionReport(options.mode, options, updatedCount);

  if (options.outputJson) {
    printJsonReport(buildRollbackJsonReport(generatedAt, rollbackCandidates, execution));
    return;
  }

  console.log(execution.message);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
