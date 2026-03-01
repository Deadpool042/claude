/**
 * Génération de devis PDF avec jsPDF.
 *
 * Produit un document A4 professionnel avec :
 * - En-tête entreprise + coordonnées client
 * - Détails du projet (type, catégorie, stack)
 * - Lignes de facturation (base, modules, déploiement)
 * - Abonnements mensuels
 * - Mentions légales
 */

import { jsPDF } from "jspdf";
import { BUSINESS_INFO } from "./business-info";
import {
  MODULE_CATALOG,
  normalizeModuleIds,
  CATEGORY_LABELS,
  MAINTENANCE_LABELS,
  MAINTENANCE_PRICES,
  resolveModulePrice,
  resolveModuleMonthly,
  type Category,
  type MaintenanceLevel,
  type TechStack,
  type ProjectType,
  type DeployTarget,
} from "./qualification";
import {
  FAMILY_BASE_PRICING,
  getStackProfileFromLegacy,
  getDeployCost,
} from "./referential";
import {
  PROJECT_TYPE_LABELS,
  TECH_STACK_LABELS,
  DEPLOY_TARGET_LABELS,
} from "./validators/project";

// ── Types ──────────────────────────────────────────────────────────

interface QuoteInput {
  project: {
    name: string;
    slug: string;
    type: string;
    category: string | null;
    techStack: string | null;
    wpHeadless?: boolean | null;
    deployTarget: string;
    description: string | null;
  };
  client: {
    name: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
  };
  config: {
    modules: string | null;
    maintenanceLevel: string | null;
    estimatedBudget: number | null;
  } | null;
}

// ── Helpers ────────────────────────────────────────────────────────

function fmtEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function generateQuoteNumber(): string {
  const now = new Date();
  const y = String(now.getFullYear());
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `D-${y}${m}${d}-${seq}`;
}

// ── PDF Generation ─────────────────────────────────────────────────

export function generateQuotePdf(input: QuoteInput): ArrayBuffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const marginL = 20;
  const marginR = 20;
  const contentW = W - marginL - marginR;
  let y = 20;

  const biz = BUSINESS_INFO;
  const quoteNum = generateQuoteNumber();
  const today = new Date();
  const validity = new Date(today);
  validity.setDate(validity.getDate() + biz.defaultValidityDays);

  // ── Colors ──
  const primary = [30, 64, 175] as const; // blue-800
  const grayDark = [55, 65, 81] as const;
  const grayLight = [107, 114, 128] as const;
  const grayBg = [243, 244, 246] as const;

  // ── Header bar ──
  doc.setFillColor(...primary);
  doc.rect(0, 0, W, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("DEVIS", marginL, 8);
  doc.text(quoteNum, W - marginR, 8, { align: "right" });

  y = 22;

  // ── Émetteur (gauche) ──
  doc.setTextColor(...grayDark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(biz.name, marginL, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...grayLight);
  doc.text(biz.address, marginL, y);
  y += 4;
  doc.text(`${biz.postalCode} ${biz.city}`, marginL, y);
  y += 4;
  doc.text(biz.email, marginL, y);
  y += 4;
  doc.text(biz.phone, marginL, y);
  if (biz.siret.length > 0) {
    y += 4;
    doc.text(`SIRET : ${biz.siret}`, marginL, y);
  }

  // ── Client (droite) ──
  const clientX = W / 2 + 10;
  let clientY = 22;
  doc.setTextColor(...grayDark);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("DESTINATAIRE", clientX, clientY);
  clientY += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(input.client.name, clientX, clientY);
  clientY += 5;

  if (input.client.firstName ?? input.client.lastName) {
    const contact = [input.client.firstName, input.client.lastName]
      .filter(Boolean)
      .join(" ");
    doc.setFontSize(9);
    doc.setTextColor(...grayLight);
    doc.text(contact, clientX, clientY);
    clientY += 5;
  }
  if (input.client.email) {
    doc.setFontSize(9);
    doc.setTextColor(...grayLight);
    doc.text(input.client.email, clientX, clientY);
    clientY += 5;
  }
  if (input.client.phone) {
    doc.setFontSize(9);
    doc.setTextColor(...grayLight);
    doc.text(input.client.phone, clientX, clientY);
    clientY += 5;
  }

  y = Math.max(y, clientY) + 6;

  // ── Dates ──
  doc.setFontSize(9);
  doc.setTextColor(...grayLight);
  doc.text(`Date : ${fmtDate(today)}`, marginL, y);
  doc.text(
    `Valide jusqu'au : ${fmtDate(validity)}`,
    W - marginR,
    y,
    { align: "right" },
  );
  y += 3;

  // ── Separator ──
  doc.setDrawColor(...primary);
  doc.setLineWidth(0.5);
  doc.line(marginL, y, W - marginR, y);
  y += 8;

  // ── Project info ──
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...grayDark);
  doc.text(`Projet : ${input.project.name}`, marginL, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayLight);

  const projectDetails: string[] = [];
  projectDetails.push(
    `Type : ${PROJECT_TYPE_LABELS[input.project.type as keyof typeof PROJECT_TYPE_LABELS]}`,
  );
  if (input.project.category) {
    projectDetails.push(
      `Catégorie : ${CATEGORY_LABELS[input.project.category as Category]}`,
    );
  }
  if (input.project.techStack) {
    projectDetails.push(
      `Stack : ${TECH_STACK_LABELS[input.project.techStack as keyof typeof TECH_STACK_LABELS]}`,
    );
  }
  projectDetails.push(
    `Déploiement : ${DEPLOY_TARGET_LABELS[input.project.deployTarget as keyof typeof DEPLOY_TARGET_LABELS]}`,
  );

  doc.text(projectDetails.join("  •  "), marginL, y);
  y += 5;

  if (input.project.description) {
    const descLines = doc.splitTextToSize(
      input.project.description,
      contentW,
    ) as string[];
    doc.text(descLines.slice(0, 3), marginL, y);
    y += Math.min(descLines.length, 3) * 4;
  }

  y += 4;

  // ── Table header ──
  const col1 = marginL;
  const col2 = W - marginR - 35;
  const col3 = W - marginR;

  doc.setFillColor(...grayBg);
  doc.rect(marginL, y - 4, contentW, 7, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...grayDark);
  doc.text("DÉSIGNATION", col1 + 2, y);
  doc.text("MONTANT", col3, y, { align: "right" });
  y += 7;

  // ── Data ──
  const category = input.project.category as Category | null;
  const techStack = (input.project.techStack ?? "WORDPRESS") as TechStack;
  const projectType = input.project.type as ProjectType;
  const deployTarget = input.project.deployTarget as DeployTarget;
  const wpHeadless = input.project.wpHeadless ?? false;

  const moduleIds: string[] = input.config?.modules
    ? normalizeModuleIds(JSON.parse(input.config.modules) as string[])
    : [];
  const activeModules = moduleIds
    .map((id) => MODULE_CATALOG.find((m) => m.id === id))
    .filter((m) => m != null);

  const stackProfile = getStackProfileFromLegacy(
    techStack,
    projectType,
    wpHeadless,
  );
  const multiplier = stackProfile.complexityFactor;

  // ── Line items ──
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayDark);

  let runningTotal = 0;

  // Base budget
  if (category) {
    const familyBase =
      FAMILY_BASE_PRICING[stackProfile.family]?.from ?? 1800;
    const basePrice = Math.round(familyBase * multiplier);
    runningTotal += basePrice;

    doc.setFont("helvetica", "normal");
    doc.text(
      `Création site web — ${CATEGORY_LABELS[category]}`,
      col1 + 2,
      y,
    );
    if (multiplier !== 1) {
      doc.setFontSize(7);
      doc.setTextColor(...grayLight);
      doc.text(
        `(coeff. stack ×${String(multiplier)})`,
        col1 + 2,
        y + 3.5,
      );
      doc.setFontSize(9);
      doc.setTextColor(...grayDark);
    }
    doc.text(fmtEur(basePrice), col3, y, { align: "right" });
    y += multiplier !== 1 ? 9 : 6;
  }

  // Modules
  for (const mod of activeModules) {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    const resolved = resolveModulePrice(mod, projectType, techStack, wpHeadless);
    runningTotal += resolved.setup;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayDark);
    doc.text(`Module — ${mod.name}`, col1 + 2, y);
    doc.setFontSize(7);
    doc.setTextColor(...grayLight);
    const descLines = doc.splitTextToSize(
      mod.description,
      col2 - col1 - 10,
    ) as string[];
    doc.text(descLines[0] ?? "", col1 + 2, y + 3.5);
    doc.setFontSize(9);
    doc.setTextColor(...grayDark);
    doc.text(fmtEur(resolved.setup), col3, y, { align: "right" });
    y += 9;
  }

  // Deploy cost
  const deployCost = getDeployCost(deployTarget, wpHeadless);
  if (deployCost > 0) {
    runningTotal += deployCost;

    doc.text(
      `Mise en production — ${DEPLOY_TARGET_LABELS[deployTarget]}`,
      col1 + 2,
      y,
    );
    doc.text(fmtEur(deployCost), col3, y, { align: "right" });
    y += 6;
  }

  // ── Total line ──
  y += 2;
  doc.setDrawColor(...primary);
  doc.setLineWidth(0.3);
  doc.line(col2 - 20, y, col3, y);
  y += 6;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primary);
  doc.text("TOTAL HT", col2 - 18, y);

  // Use estimated budget if available, else calculated
  const totalDisplay =
    input.config?.estimatedBudget ?? runningTotal;
  doc.text(fmtEur(totalDisplay), col3, y, { align: "right" });
  y += 8;

  // ── Monthly costs section ──
  let totalMonthly = 0;
  const monthlyItems: Array<{ label: string; price: number }> = [];

  for (const mod of activeModules) {
    const monthly = resolveModuleMonthly(mod);
    if (monthly > 0) {
      totalMonthly += monthly;
      monthlyItems.push({ label: mod.name, price: monthly });
    }
  }

  // Maintenance
  const maintenanceLevel = input.config?.maintenanceLevel as MaintenanceLevel | null;

  if (monthlyItems.length > 0 || maintenanceLevel) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    y += 2;
    doc.setFillColor(...grayBg);
    doc.rect(marginL, y - 4, contentW, 7, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...grayDark);
    doc.text("ABONNEMENTS MENSUELS", col1 + 2, y);
    doc.text("/ MOIS", col3, y, { align: "right" });
    y += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    for (const item of monthlyItems) {
      doc.setTextColor(...grayDark);
      doc.text(item.label, col1 + 2, y);
      doc.text(fmtEur(item.price), col3, y, { align: "right" });
      y += 5;
    }

    if (maintenanceLevel) {
      doc.setTextColor(...grayDark);
      doc.text(
        `Maintenance — ${MAINTENANCE_LABELS[maintenanceLevel]}`,
        col1 + 2,
        y,
      );
      doc.setFontSize(7);
      doc.setTextColor(...grayLight);
      doc.text(MAINTENANCE_PRICES[maintenanceLevel], col3, y, {
        align: "right",
      });
      y += 5;
      doc.setFontSize(9);
    }

    if (totalMonthly > 0) {
      y += 2;
      doc.setDrawColor(...primary);
      doc.setLineWidth(0.3);
      doc.line(col2 - 20, y, col3, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primary);
      doc.text("TOTAL MENSUEL", col2 - 18, y);
      doc.text(`${fmtEur(totalMonthly)}/mois`, col3, y, {
        align: "right",
      });
    }
  }

  // ── Footer / mentions légales ──
  const footerY = 270;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayLight);
  doc.text(biz.tvaNotice, marginL, footerY);
  doc.text(
    `Devis ${quoteNum} — Validité : ${String(biz.defaultValidityDays)} jours`,
    marginL,
    footerY + 4,
  );
  doc.text(
    "En cas d'acceptation, merci de retourner ce devis signé avec la mention « Bon pour accord ».",
    marginL,
    footerY + 8,
  );

  // Footer bar
  doc.setFillColor(...primary);
  doc.rect(0, 290, W, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(
    `${biz.name} — ${biz.email} — ${biz.phone}`,
    W / 2,
    294,
    { align: "center" },
  );

  return doc.output("arraybuffer");
}
