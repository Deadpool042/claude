import { PageLayout } from "@/components/shell/page-layout";
import { OffersClient } from "@/features/dashboard/offres";

export default function OffresPage() {
  return (
    <PageLayout
      title="Offres"
      description="Tarifs, modules, et options de mise en ligne."
    >
      <OffersClient />
    </PageLayout>
  );
}
