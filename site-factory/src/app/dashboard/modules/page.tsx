import { PageLayout } from "@/components/shell/page-layout";
import { ModulesClient } from "./_components/modules-client";

export default function ModulesPage() {
  return (
    <PageLayout
      title="Modules"
      description="Details par module, compatibilite stack et justification tarifaire."
    >
      <ModulesClient />
    </PageLayout>
  );
}
