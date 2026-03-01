"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { useBreadcrumbOverrides } from "./breadcrumb-context";

interface BreadcrumbSegment {
  label: string;
  href: string;
}

const LABEL_MAP: Partial<Record<string, string>> = {
  dashboard: "Dashboard",
  clients: "Clients",
  projects: "Projets",
  configs: "Configs",
  infra: "Infra",
  new: "Nouveau",
  edit: "Modifier",
};

function buildBreadcrumbs(
  pathname: string,
  overrides: Partial<Record<string, string>>,
): BreadcrumbSegment[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: BreadcrumbSegment[] = [];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label =
      overrides[segment] ?? LABEL_MAP[segment] ?? decodeURIComponent(segment);
    crumbs.push({ label, href: currentPath });
  }

  return crumbs;
}

export function Header() {
  const pathname = usePathname();
  const overrides = useBreadcrumbOverrides();
  const breadcrumbs = buildBreadcrumbs(pathname, overrides);

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <Fragment key={crumb.href}>
            {index > 0 && <ChevronRight className="size-3.5" />}
            {isLast ? (
              <span className="font-medium text-foreground">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-foreground transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
