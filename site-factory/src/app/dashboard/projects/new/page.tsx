import { WizardContent } from "./_components/wizard-content";

/**
 * Page serveur pour la création de projet.
 * Le contenu interactif est délégué au composant client WizardContent
 * qui consomme le WizardContext fourni par layout.tsx.
 */
export default function NewProjectPage() {
  return <WizardContent />;
}
