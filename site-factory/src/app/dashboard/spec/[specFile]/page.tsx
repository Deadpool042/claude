import { PageLayout } from "@/shared/components/shell/page-layout";
import { SpecFileEditorClient } from "@/features/spec";

export default async function SpecFilePage({
  params,
}: {
  params: Promise<{ specFile: string }>;
}) {
  const { specFile } = await params;
  const label = decodeURIComponent(specFile).replace(".json", "");

  return (
    <PageLayout
      title={label}
      description={`Lecture et édition progressive du fichier spec : ${decodeURIComponent(specFile)}`}
    >
      <SpecFileEditorClient specFile={decodeURIComponent(specFile)} />
    </PageLayout>
  );
}
