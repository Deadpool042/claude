import { PageLayout } from "@/shared/components/shell/page-layout";
import { SpecListClient } from "@/features/spec/ui/SpecListClient";

export default function SpecPage() {
  return (
    <PageLayout
      title="Catalogue des specs"
      description="Vue d’ensemble du référentiel JSON avant lecture détaillée et édition."
    >
      <SpecListClient />
    </PageLayout>
  );
}
