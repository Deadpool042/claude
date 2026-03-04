export type ProjectType = "BLOG" | "VITRINE" | "ECOM" | "APP";

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  BLOG: "Blog",
  VITRINE: "Vitrine",
  ECOM: "E-commerce",
  APP: "Application",
};

export const PROJECT_TYPE_OPTIONS: Array<{
  value: ProjectType;
  label: string;
}> = [
  { value: "VITRINE", label: PROJECT_TYPE_LABELS.VITRINE },
  { value: "BLOG", label: PROJECT_TYPE_LABELS.BLOG },
  { value: "ECOM", label: PROJECT_TYPE_LABELS.ECOM },
  { value: "APP", label: PROJECT_TYPE_LABELS.APP },
];