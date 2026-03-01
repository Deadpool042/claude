import { Suspense } from "react";
import { PageLayout } from "@/components/shell/page-layout";
import { WizardProvider } from "./_providers/wizard-provider";

/**
 * Layout serveur pour le wizard de création de projet.
 *
 * Utilise les routes parallèles Next.js (@slot) :
 *   - {children}      → contenu principal (steps du wizard)
 *   - {stepper}        → barre de navigation entre les étapes
 *   - {sidebar}        → panneau latéral de qualification live
 *   - {modules}        → panneau latéral de details modules
 *
 * WizardProvider (client) fournit le contexte partagé à tous les slots.
 */
export default function NewProjectLayout({
  children,
  stepper,
  sidebar,
  modules,
}: {
  children: React.ReactNode;
  stepper: React.ReactNode;
  sidebar: React.ReactNode;
  modules?: React.ReactNode;
}) {
  return (
    <Suspense>
      <WizardProvider>
        <PageLayout
          title="Nouveau projet"
          description="Flux décisionnel — qualification et création de projet"
        >
          <div className="mx-auto max-w-4xl">
            {/* Stepper (toujours visible) */}
            {stepper}

            {/* Contenu principal + sidebar qualification */}
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 min-w-0">{children}</div>
              <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-20 lg:self-start space-y-4">
                {sidebar}
                {modules}
              </div>
            </div>
          </div>
        </PageLayout>
      </WizardProvider>
    </Suspense>
  );
}
