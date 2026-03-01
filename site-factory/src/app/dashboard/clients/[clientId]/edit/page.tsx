import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageLayout } from "@/components/shell/page-layout";
import { BreadcrumbOverride } from "@/components/shell/breadcrumb-context";
import { ClientEditForm } from "./_components/client-edit-form";

interface EditClientPageProps {
  params: Promise<{ clientId: string }>;
}

export default async function EditClientPage({
  params,
}: EditClientPageProps) {
  const { clientId } = await params;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    notFound();
  }

  return (
    <>
      <BreadcrumbOverride segments={{ [clientId]: client.name }} />
      <PageLayout
        title={`Modifier ${client.name}`}
        description={`Slug actuel : ${client.slug}`}
      >
        <ClientEditForm
          client={{
            id: client.id,
            name: client.name,
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            phone: client.phone,
            notes: client.notes,
          }}
        />
      </PageLayout>
    </>
  );
}
