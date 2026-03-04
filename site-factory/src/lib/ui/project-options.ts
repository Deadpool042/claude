import { Server, Globe, Cloud } from "lucide-react";
import type {
  DeployTarget,
  LegacyTechStack as TechStack,
  ProjectType,
} from "@/lib/referential";

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

export const PROJECT_TYPE_ALLOWED_TECH_STACKS: Record<ProjectType, TechStack[]> = {
  BLOG: ["WORDPRESS", "NEXTJS", "NUXT", "ASTRO"],
  VITRINE: ["WORDPRESS", "NEXTJS", "NUXT", "ASTRO"],
  ECOM: ["WORDPRESS", "NEXTJS", "NUXT", "ASTRO"],
  APP: ["NEXTJS", "NUXT", "ASTRO"],
};

export function getAllowedTechStacksForProjectType(projectType: ProjectType): TechStack[] {
  return PROJECT_TYPE_ALLOWED_TECH_STACKS[projectType];
}