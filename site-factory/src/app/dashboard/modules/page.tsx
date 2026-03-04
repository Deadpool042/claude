import { PageLayout } from "@/components/shell/page-layout";
import { ModulesClient } from "@/features/dashboard/modules";

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
