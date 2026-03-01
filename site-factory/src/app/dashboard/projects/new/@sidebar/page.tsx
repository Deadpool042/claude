import { QualificationSidebar } from "../_components/qualification-sidebar";

/**
 * Slot parallèle @sidebar.
 * Server component qui délègue au composant client QualificationSidebar.
 */
export default function SidebarSlot() {
  return <QualificationSidebar />;
}
