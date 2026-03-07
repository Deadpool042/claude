"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  BadgePercent,
  Settings,
  Network,
  Boxes,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileJson,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useEffect, useMemo, useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Projets", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Offres", href: "/dashboard/offres", icon: BadgePercent },
  { name: "Modules", href: "/dashboard/modules", icon: Boxes },
  { name: "Spécifications", href: "/dashboard/spec", icon: FileJson },
  { name: "Documentation", href: "/dashboard/docs", icon: BookOpen },
  { name: "Configs", href: "/dashboard/configs", icon: Settings },
  { name: "Infra / Traefik", href: "/dashboard/infra", icon: Network },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const storageKey = "sf.sidebar.collapsed";

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      setCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(storageKey, String(next));
      return next;
    });
  };

  const navItems = useMemo(
    () =>
      navigation.map((item) => ({
        ...item,
        isActive:
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href)),
      })),
    [pathname],
  );

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col border-r bg-sidebar/95 backdrop-blur transition-[width]",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className={cn("flex h-14 items-center border-b", collapsed ? "px-3" : "px-6")}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-indigo-500 text-primary-foreground shadow">
            <span className="text-sm font-bold">SF</span>
          </div>
          {!collapsed && <span className="text-lg font-semibold">Site Factory</span>}
        </Link>
        <button
          type="button"
          onClick={toggleCollapsed}
          className={cn(
            "ml-auto inline-flex size-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition hover:bg-sidebar-accent/50 hover:text-foreground",
            collapsed ? "ml-auto" : "ml-auto",
          )}
          aria-label={collapsed ? "Étendre le menu" : "Réduire le menu"}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>
      <nav className={cn("flex-1 space-y-1", collapsed ? "p-2" : "p-3")}>
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            title={collapsed ? item.name : undefined}
            className={cn(
              "flex items-center rounded-lg text-sm font-medium transition-colors",
              collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
              item.isActive
                ? "bg-linear-to-r from-primary/20 to-transparent text-foreground shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            )}
          >
            <item.icon className="size-4" />
            {!collapsed && item.name}
          </Link>
        ))}
      </nav>
      <div className={cn("border-t", collapsed ? "p-3" : "p-4")}>
        {!collapsed && (
          <p className="text-xs text-muted-foreground">Site Factory v0.1.0</p>
        )}
      </div>
    </div>
  );
}
