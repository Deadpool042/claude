import { PageLayout } from "@/components/shell/page-layout";
import { OffersClient } from "./_components/offers-client";

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
