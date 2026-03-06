import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { BreadcrumbProvider } from "@/shared/providers/breadcrumb-context";
import { ModeToggle } from "./mode-toggle";

interface AppShellProps {
  sidebar?: ReactNode;
  header?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}

export function AppShell({
  sidebar,
  header,
  actions,
  aside,
  children,
}: AppShellProps) {
  return (
    <BreadcrumbProvider>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        {sidebar ?? <Sidebar />}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex h-14 items-center justify-between border-b border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-transparent px-6">
            <div className="flex-1">{header ?? <Header />}</div>
            <div className="ml-4 flex items-center gap-2">
              {actions}
              <ModeToggle />
            </div>
          </div>
          <div className="flex flex-1 overflow-hidden">
            <main className="relative flex-1 overflow-y-auto p-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60" />
              <div className="relative">{children}</div>
            </main>
            {aside ? (
              <aside className="hidden w-80 shrink-0 overflow-y-auto border-l p-6 xl:block">
                {aside}
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
