import { WizardContent } from "@/features/dashboard/projects/new";

/**
 * Page serveur pour la création de projet.
 * Le contenu interactif est délégué au composant client WizardContent
 * qui consomme le WizardContext fourni par layout.tsx.
 */
export default function NewProjectPage() {
  // return <p>Coming soon</p>
  return <WizardContent />;
}
