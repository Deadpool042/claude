import type { ProjectType } from "@/lib/referential";

export interface MarketGuardrail {
  ciRange: string;
  categoryRange: string;
  floor: number;
  creationRange: string;
}

export const MARKET_GUARDRAILS: Record<ProjectType, MarketGuardrail> = {
  BLOG: {
    ciRange: "5-10",
    categoryRange: "CAT0-CAT1",
    floor: 1290,
    creationRange: "1 290-3 250 €",
  },
  VITRINE: {
    ciRange: "5-10",
    categoryRange: "CAT0-CAT1",
    floor: 1290,
    creationRange: "1 290-3 250 €",
  },
  ECOM: {
    ciRange: "11-20",
    categoryRange: "CAT2-CAT3",
    floor: 3500,
    creationRange: "3 500-9 900 €",
  },
  APP: {
    ciRange: "16-25",
    categoryRange: "CAT3-CAT4",
    floor: 4500,
    creationRange: "4 500 € et +",
  },
};

export const MARKET_TYPE_LABELS: Record<ProjectType, string> = {
  BLOG: "Blog",
  VITRINE: "Site vitrine",
  ECOM: "E-commerce",
  APP: "Application",
};
