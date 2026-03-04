import { QualificationSidebar } from "@/features/dashboard/projects/new";

/**
 * Slot parallèle @sidebar.
 * Server component qui délègue au composant client QualificationSidebar.
 */
export default function SidebarSlot() {
  return <QualificationSidebar />;
}
