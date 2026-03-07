"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  LayoutDashboard,
  Euro,
  Code,
  Cloud,
  Server,
  Container,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

// ── Types ──────────────────────────────────────────────────────────

interface ProjectTabsProps {
  overview: ReactNode;
  commercial: ReactNode;
  technique: ReactNode;
  deployment: ReactNode;
  infrastructure: ReactNode;
  services: ReactNode;
  wordpress?: ReactNode;
}

// ── Tab config ─────────────────────────────────────────────────────

const BASE_TABS = [
  {
    value: "overview",
    label: "Vue d’ensemble",
    icon: LayoutDashboard,
  },
  {
    value: "commercial",
    label: "Commercial",
    icon: Euro,
  },
  {
    value: "technique",
    label: "Technique",
    icon: Code,
  },
  {
    value: "deployment",
    label: "Déploiement",
    icon: Cloud,
  },
  {
    value: "infrastructure",
    label: "Infrastructure",
    icon: Server,
  },
  {
    value: "services",
    label: "Services",
    icon: Container,
  },
] as const;

// ── Component ──────────────────────────────────────────────────────

export function ProjectTabs({
  overview,
  commercial,
  technique,
  deployment,
  infrastructure,
  services,
  wordpress,
}: ProjectTabsProps) {
  const tabs = wordpress
    ? [
        ...BASE_TABS,
        {
          value: "wordpress",
          label: "WordPress",
          icon: Wrench,
        },
      ]
    : BASE_TABS;

  return (
    <Tabs defaultValue="overview">
      <TabsList variant="line" className="w-full justify-start border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
              <Icon className="size-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value="overview" className="mt-6">
        {overview}
      </TabsContent>
      <TabsContent value="commercial" className="mt-6">
        {commercial}
      </TabsContent>
      <TabsContent value="technique" className="mt-6">
        {technique}
      </TabsContent>
      <TabsContent value="deployment" className="mt-6">
        {deployment}
      </TabsContent>
      <TabsContent value="infrastructure" className="mt-6">
        {infrastructure}
      </TabsContent>
      <TabsContent value="services" className="mt-6">
        {services}
      </TabsContent>
      {wordpress ? (
        <TabsContent value="wordpress" className="mt-6">
          {wordpress}
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
