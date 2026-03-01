/**
 * UI constants and helpers shared between the wizard and edit form.
 * Keeps presentation concerns separate from the core qualification engine.
 */

import {
  Server,
  Globe,
  Cloud,
  ShoppingBag,
  BookOpen,
  Wrench,
  Briefcase,
  Crown,
  Languages,
  Coins,
  CreditCard,
  Truck,
  ShoppingCart,
  BarChart3,
  UserCircle,
  Mail,
  Target,
  Search,
  Shield,
  Filter,
  Moon,
  Accessibility,
  Plug,
  Bot,
  Receipt,
  Calculator,
  LayoutDashboard,
  Gauge,
  Layers,
} from "lucide-react";

import type { ProjectType, TechStack, DeployTarget } from "./qualification";

// ── Module icon map ────────────────────────────────────────────────

export const MODULE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Languages,
  Coins,
  CreditCard,
  Truck,
  ShoppingCart,
  BarChart3,
  UserCircle,
  Mail,
  Target,
  Search,
  Shield,
  Filter,
  Moon,
  Accessibility,
  Plug,
  Bot,
  Receipt,
  Calculator,
  LayoutDashboard,
  Gauge,
  Layers,
};

// ── Group icon map ─────────────────────────────────────────────────

export const GROUP_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  ecommerce: ShoppingBag,
  contenu: BookOpen,
  technique: Wrench,
  metier: Briefcase,
  premium: Crown,
};

// ── Project type options ───────────────────────────────────────────

export const PROJECT_TYPE_OPTIONS: {
  value: ProjectType;
  label: string;
  desc: string;
  icon: string;
}[] = [
  {
    value: "STARTER",
    label: "Starter",
    desc: "Mini-site, petit budget",
    icon: "🌱",
  },
  {
    value: "BLOG",
    label: "Blog",
    desc: "Blog ou magazine, contenus éditoriaux",
    icon: "📝",
  },
  {
    value: "VITRINE",
    label: "Site vitrine",
    desc: "Présentation, landing pages",
    icon: "🏢",
  },
  {
    value: "ECOM",
    label: "E-commerce",
    desc: "Boutique en ligne, catalogue produits",
    icon: "🛒",
  },
  {
    value: "APP",
    label: "Application",
    desc: "Application web avancée",
    icon: "⚡",
  },
];

// ── Tech stack options ─────────────────────────────────────────────

export const TECH_STACK_OPTIONS: {
  value: TechStack;
  label: string;
  desc: string;
  icon: string;
}[] = [
  {
    value: "WORDPRESS",
    label: "WordPress",
    desc: "CMS PHP, thèmes, plugins",
    icon: "🔵",
  },
  {
    value: "NEXTJS",
    label: "Next.js",
    desc: "Framework React full-stack",
    icon: "▲",
  },
  {
    value: "NUXT",
    label: "Nuxt",
    desc: "Framework Vue.js full-stack",
    icon: "💚",
  },
  {
    value: "ASTRO",
    label: "Astro",
    desc: "Multi-framework, statique",
    icon: "🚀",
  },
];

// ── Deploy target options ──────────────────────────────────────────

export const DEPLOY_TARGET_OPTIONS: {
  value: DeployTarget;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}[] = [
  {
    value: "DOCKER",
    label: "Docker / VPS",
    icon: Server,
    desc: "Containers, Traefik, tout stack",
  },
  {
    value: "VERCEL",
    label: "Vercel / Cloud",
    icon: Cloud,
    desc: "Next.js, Nuxt, Astro (serverless)",
  },
  {
    value: "SHARED_HOSTING",
    label: "Mutualisé",
    icon: Globe,
    desc: "o2switch, OVH… (WordPress only)",
  },
];

// ── Wizard steps ───────────────────────────────────────────────────

export const WIZARD_STEPS = [
  { id: 0, label: "Cadrage", short: "Cadrage" },
  { id: 1, label: "Modules", short: "Modules" },
  { id: 2, label: "Projet", short: "Projet" },
  { id: 3, label: "Résumé", short: "Résumé" },
] as const;

// ── Formatting ─────────────────────────────────────────────────────

export function formatEur(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}
