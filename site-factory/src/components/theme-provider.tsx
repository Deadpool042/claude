"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Theme } from "@radix-ui/themes";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";

function RadixTheme({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Theme appearance={mounted && resolvedTheme === "dark" ? "dark" : "light"} hasBackground={false}>
      {children}
    </Theme>
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <RadixTheme>{children}</RadixTheme>
    </NextThemesProvider>
  );
}
