import { FieldSelect } from "@/shared/components/FieldSelect";
import { InlineHint } from "@/shared/components/InlineHint";
import { Label } from "@/shared/components/ui/label";
import type { WizardContextType } from "../../logic/wizard-types";

interface ContextSectionProps {
  projectType: WizardContextType["projectType"];
  commerceModel: WizardContextType["commerceModel"];
  setCommerceModel: WizardContextType["setCommerceModel"];
  productCount: WizardContextType["productCount"];
  setProductCount: WizardContextType["setProductCount"];
  trafficLevel: WizardContextType["trafficLevel"];
  setTrafficLevel: WizardContextType["setTrafficLevel"];
  dataSensitivity: WizardContextType["dataSensitivity"];
  setDataSensitivity: WizardContextType["setDataSensitivity"];
  scalabilityLevel: WizardContextType["scalabilityLevel"];
  setScalabilityLevel: WizardContextType["setScalabilityLevel"];
  qCommerceModel: number | null;
  qProductCount: number | null;
}

export function ContextSection({
  projectType,
  commerceModel,
  setCommerceModel,
  productCount,
  setProductCount,
  trafficLevel,
  setTrafficLevel,
  dataSensitivity,
  setDataSensitivity,
  scalabilityLevel,
  setScalabilityLevel,
  qCommerceModel,
  qProductCount,
}: ContextSectionProps) {
  return (
    <>
      {projectType === "ECOM" && (
        <div className="space-y-4 rounded-lg border p-3">
          <InlineHint>
            Qualification du modèle métier en amont (SaaS, auto-hébergé, headless), puis proposition de stack.
          </InlineHint>

          <FieldSelect
            label={`Question ${qCommerceModel} · Modèle e-commerce`}
            value={commerceModel}
            onChange={(value) => setCommerceModel(value as WizardContextType["commerceModel"])}
            options={[
              { value: "SAAS", label: "SaaS (Shopify…)" },
              { value: "SELF_HOSTED", label: "Auto-hébergé" },
              { value: "HEADLESS", label: "Headless" },
            ]}
            tooltip="Le modèle choisi détermine les familles d’implémentation proposées."
            helpText="SaaS: solution opérée. Auto-hébergé: contrôle total. Headless: découplage front/back."
          />

          <FieldSelect
            label={`Question ${qProductCount} · Volume produits`}
            value={productCount}
            onChange={(value) => setProductCount(value as WizardContextType["productCount"])}
            options={[
              { value: "SMALL", label: "Petit" },
              { value: "MEDIUM", label: "Moyen" },
              { value: "LARGE", label: "Large" },
            ]}
            tooltip="Volume catalogue pris en compte dans le cadrage performance et exploitation."
            helpText="Le volume impacte surtout recherche, indexation, synchronisation et coûts d’infrastructure."
          />
        </div>
      )}

      <div className="space-y-3 rounded-lg border p-3">
        <Label>Questions de contexte</Label>
        <InlineHint>
          Ces paramètres alimentent le Complexity Index et les recommandations techniques.
        </InlineHint>

        <div className="grid gap-3 sm:grid-cols-3">
          <FieldSelect
            label="Trafic"
            value={trafficLevel}
            onChange={(value) => setTrafficLevel(value as WizardContextType["trafficLevel"])}
            options={[
              { value: "LOW", label: "Faible" },
              { value: "MEDIUM", label: "Moyen" },
              { value: "HIGH", label: "Élevé" },
            ]}
            tooltip="Volume attendu de visites et de requêtes applicatives."
            helpText="Niveau de charge cible pour dimensionner les services applicatifs."
          />

          <FieldSelect
            label="Données"
            value={dataSensitivity}
            onChange={(value) => setDataSensitivity(value as WizardContextType["dataSensitivity"])}
            options={[
              { value: "STANDARD", label: "Standard" },
              { value: "SENSITIVE", label: "Sensible" },
              { value: "REGULATED", label: "Réglementé" },
            ]}
            tooltip="Niveau de sensibilité des données traitées (RGPD, conformité, audit)."
            helpText="Une sensibilité plus forte implique des exigences de sécurité et de traçabilité plus strictes."
          />

          <FieldSelect
            label="Scalabilité"
            value={scalabilityLevel}
            onChange={(value) => setScalabilityLevel(value as WizardContextType["scalabilityLevel"])}
            options={[
              { value: "FIXED", label: "Fixe" },
              { value: "GROWING", label: "Croissante" },
              { value: "ELASTIC", label: "Élastique" },
            ]}
            tooltip="Capacité d’évolution attendue en charge et en périmètre fonctionnel."
            helpText="Niveau d’élasticité attendu pour absorber croissance, pics et extensions fonctionnelles."
          />
        </div>
      </div>
    </>
  );
}
