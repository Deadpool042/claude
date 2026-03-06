import { FieldSelect } from "@/shared/components/FieldSelect";
import { FieldSwitch } from "@/shared/components/FieldSwitch";
import { InlineHint } from "@/shared/components/InlineHint";
import { Label } from "@/shared/components/ui/label";
import type { WizardContextType } from "../../logic/wizard-types";

interface EditorialSectionProps {
  projectType: WizardContextType["projectType"];
  needsEditing: boolean;
  setNeedsEditing: (value: boolean) => void;
  editingMode: WizardContextType["editingMode"];
  setEditingMode: WizardContextType["setEditingMode"];
  editingFrequency: WizardContextType["editingFrequency"];
  setEditingFrequency: WizardContextType["setEditingFrequency"];
  editorialPushOwner: WizardContextType["editorialPushOwner"];
  setEditorialPushOwner: WizardContextType["setEditorialPushOwner"];
  clientAccessPolicy: WizardContextType["clientAccessPolicy"];
  setClientAccessPolicy: WizardContextType["setClientAccessPolicy"];
  includeOnboardingPack: boolean;
  setIncludeOnboardingPack: (value: boolean) => void;
  includeMonthlyEditorialValidation: boolean;
  setIncludeMonthlyEditorialValidation: (value: boolean) => void;
  includeUnblockInterventions: boolean;
  setIncludeUnblockInterventions: (value: boolean) => void;
  qNeedsEditing: number;
  qEditingMode: number | null;
  qEditingFrequency: number | null;
  qEditorialOwner: number | null;
  qClientAccess: number | null;
}

export function EditorialSection({
  projectType,
  needsEditing,
  setNeedsEditing,
  editingMode,
  setEditingMode,
  editingFrequency,
  setEditingFrequency,
  editorialPushOwner,
  setEditorialPushOwner,
  clientAccessPolicy,
  setClientAccessPolicy,
  includeOnboardingPack,
  setIncludeOnboardingPack,
  includeMonthlyEditorialValidation,
  setIncludeMonthlyEditorialValidation,
  includeUnblockInterventions,
  setIncludeUnblockInterventions,
  qNeedsEditing,
  qEditingMode,
  qEditingFrequency,
  qEditorialOwner,
  qClientAccess,
}: EditorialSectionProps) {
  return (
    <>
      <FieldSwitch
        label={`Question ${qNeedsEditing} · Besoin d’édition continue`}
        description="Le contenu doit évoluer après mise en ligne (CMS ou fichiers MDX/Git)."
        tooltip="Activer si des mises à jour de contenu sont prévues dans le temps, même sans back-office."
        checked={needsEditing}
        onCheckedChange={(value) => {
          setNeedsEditing(value);
          if (!value) {
            setEditingMode("TO_CONFIRM");
            setEditorialPushOwner("TO_CONFIRM");
            setClientAccessPolicy("TO_CONFIRM");
            setIncludeOnboardingPack(false);
            setIncludeMonthlyEditorialValidation(false);
            setIncludeUnblockInterventions(false);
          }
        }}
      />

      {needsEditing && (
        <FieldSelect
          label={`Question ${qEditingMode} · Mode d’édition envisagé`}
          value={editingMode}
          onChange={(value) => {
            const nextMode = value as WizardContextType["editingMode"];
            setEditingMode(nextMode);
            if (nextMode !== "GIT_MDX") {
              setEditorialPushOwner("TO_CONFIRM");
              setClientAccessPolicy("TO_CONFIRM");
              setIncludeOnboardingPack(false);
              setIncludeMonthlyEditorialValidation(false);
              setIncludeUnblockInterventions(false);
            }
          }}
          options={[
            { value: "BACKOFFICE", label: "Back-office CMS" },
            { value: "GIT_MDX", label: "Fichiers versionnés (MDX/Git)" },
            { value: "TO_CONFIRM", label: "À confirmer" },
          ]}
          tooltip="Le back-office n’est pas obligatoire : l’édition peut aussi se faire via des fichiers MDX versionnés."
          helpText="Ce choix affine le cadrage technique proposé à l’étape suivante."
        />
      )}

      {needsEditing && (
        <FieldSelect
          label={`Question ${qEditingFrequency} · Fréquence d’édition`}
          value={editingFrequency}
          onChange={(value) => setEditingFrequency(value as WizardContextType["editingFrequency"])}
          options={[
            { value: "RARE", label: "Rare" },
            { value: "REGULAR", label: "Régulier" },
            { value: "DAILY", label: "Quotidien" },
          ]}
          tooltip="Rythme moyen de publication, utilisé pour orienter les choix techniques."
          helpText="Une fréquence plus élevée augmente les besoins d’outillage éditorial et d’exploitation."
        />
      )}

      {needsEditing && editingMode === "GIT_MDX" && (
        <FieldSelect
          label={`Question ${qEditorialOwner} · Qui publie les contenus ?`}
          value={editorialPushOwner}
          onChange={(value) => {
            const nextOwner = value as WizardContextType["editorialPushOwner"];
            setEditorialPushOwner(nextOwner);
            if (nextOwner !== "CLIENT") {
              setClientAccessPolicy("TO_CONFIRM");
            }
          }}
          options={[
            { value: "CLIENT", label: "Équipe client (rédige et push)" },
            { value: "AGENCY", label: "Client rédige, agence publie (push opéré)" },
            { value: "TO_CONFIRM", label: "À confirmer" },
          ]}
          tooltip="Point contractuel clé pour définir responsabilités, validation et support incident."
          helpText="Cas fréquent : le client rédige les contenus et l’agence exécute la publication Git/MDX."
        />
      )}

      {needsEditing && editingMode === "GIT_MDX" && editorialPushOwner === "CLIENT" && (
        <FieldSelect
          label={`Question ${qClientAccess} · Limite d’accès client`}
          value={clientAccessPolicy}
          onChange={(value) =>
            setClientAccessPolicy(value as WizardContextType["clientAccessPolicy"])
          }
          options={[
            {
              value: "CONTENT_REPO_ONLY",
              label: "Repo contenu uniquement (pas de push production)",
            },
            {
              value: "CONTENT_REPO_WITH_PR",
              label: "Repo + pull request validée obligatoire",
            },
            { value: "TO_CONFIRM", label: "À confirmer" },
          ]}
          tooltip="Les secrets CI/CD et l’administration infra restent hors accès client par défaut."
          helpText="Cette limite d’accès cadre la responsabilité opérationnelle de publication."
        />
      )}

      {needsEditing && editingMode === "GIT_MDX" && (
        <div className="space-y-3 rounded-lg border p-3">
          <Label>Coûts en sus à prévoir (si applicable)</Label>
          <InlineHint>
            Ces options sont hors CI et hors budget produit de base ; elles cadrent le service éditorial.
          </InlineHint>
          <FieldSwitch
            label="Onboarding Git/MDX (atelier + workflow)"
            description="Repère : 300–500 € HT"
            checked={includeOnboardingPack}
            onCheckedChange={setIncludeOnboardingPack}
          />
          <FieldSwitch
            label="Validation éditoriale mensuelle (jusqu’à 4 PR)"
            description="Repère : 120–250 € HT / mois"
            checked={includeMonthlyEditorialValidation}
            onCheckedChange={setIncludeMonthlyEditorialValidation}
          />
          <FieldSwitch
            label="Interventions de déblocage build/publication"
            description="Repère : 90–150 € HT / intervention"
            checked={includeUnblockInterventions}
            onCheckedChange={setIncludeUnblockInterventions}
          />
        </div>
      )}

      {(projectType === "VITRINE" || projectType === "BLOG") && needsEditing && editingFrequency === "DAILY" ? (
        <InlineHint>
          Cas fréquent : vitrine/blog en Next.js, Nuxt ou Astro + MDX sans base de données dédiée, avec édition continue.
        </InlineHint>
      ) : null}

      {needsEditing && editingMode === "GIT_MDX" ? (
        <InlineHint>
          L’édition MDX peut rester sans back-office dédié : dépôt Git + workflow éditorial versionné.
        </InlineHint>
      ) : null}
    </>
  );
}
