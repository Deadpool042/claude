import type { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  description?: string;
  toolbar?: ReactNode;
  children: ReactNode;
}

export function PageLayout({
  title,
  description,
  toolbar,
  children,
}: PageLayoutProps) {
  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute -top-10 left-0 right-0 h-28 rounded-[32px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-60" />
      <div className="relative flex items-start justify-between rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-transparent to-transparent px-6 py-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {toolbar ? <div className="flex items-center gap-2">{toolbar}</div> : null}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
