import { FieldSelect } from "@/components/shared/FieldSelect";
import { InlineHint } from "@/components/shared/InlineHint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROJECT_TYPE_OPTIONS } from "@/lib/referential";
import { MODULE_CATALOG } from "@/lib/referential";
import { suggestModuleRecommendationsFromDiscovery } from "../../logic/module-suggestions";
import { deriveDiscoveryInsights } from "../../logic/discovery-insights";
import type { WizardContextType } from "../../logic/WizardProvider";

type ProjectTypeValue = NonNullable<WizardContextType["projectType"]>;

interface DiscoverySectionProps {
  projectType: WizardContextType["projectType"];
  changeProjectType: WizardContextType["changeProjectType"];
  budgetBand: WizardContextType["budgetBand"];
  setBudgetBand: WizardContextType["setBudgetBand"];
  manualBudgetMax: WizardContextType["manualBudgetMax"];
  setManualBudgetMax: WizardContextType["setManualBudgetMax"];
  budgetBandEffective: WizardContextType["budgetBandEffective"];
  clientKnowledge: WizardContextType["clientKnowledge"];
  setClientKnowledge: WizardContextType["setClientKnowledge"];
  primaryGoal: WizardContextType["primaryGoal"];
  setPrimaryGoal: WizardContextType["setPrimaryGoal"];
  ambitionLevel: WizardContextType["ambitionLevel"];
  setAmbitionLevel: WizardContextType["setAmbitionLevel"];
  targetTimeline: WizardContextType["targetTimeline"];
  setTargetTimeline: WizardContextType["setTargetTimeline"];
  commerceModel: WizardContextType["commerceModel"];
  trafficLevel: WizardContextType["trafficLevel"];
  dataSensitivity: WizardContextType["dataSensitivity"];
  scalabilityLevel: WizardContextType["scalabilityLevel"];
  needsEditing: boolean;
  editingMode: WizardContextType["editingMode"];
  editorialPushOwner: WizardContextType["editorialPushOwner"];
  qType: number;
  qBudget: number | null;
  qKnowledge: number | null;
  qGoal: number | null;
  qAmbition: number | null;
  qTimeline: number | null;
}

const goalOptionsByProjectType: Record<
  ProjectTypeValue,
  Array<{ value: string; label: string }>
> = {
  VITRINE: [
    { value: "PRESENCE", label: "Présence en ligne claire" },
    { value: "GENERATE_LEADS", label: "Générer des prospects" },
    { value: "PUBLISH_CONTENT", label: "Publier des actualités" },
    { value: "TO_CONFIRM", label: "À confirmer" },
  ],
  BLOG: [
    { value: "PUBLISH_CONTENT", label: "Publier du contenu régulièrement" },
    { value: "GENERATE_LEADS", label: "Attirer des prospects" },
    { value: "PRESENCE", label: "Asseoir la présence de marque" },
    { value: "TO_CONFIRM", label: "À confirmer" },
  ],
  ECOM: [
    { value: "SELL_ONLINE", label: "Vendre en ligne" },
    { value: "GENERATE_LEADS", label: "Acquisition et conversion" },
    { value: "PRESENCE", label: "Présence e-commerce minimale" },
    { value: "TO_CONFIRM", label: "À confirmer" },
  ],
  APP: [
    { value: "DIGITIZE_PROCESS", label: "Digitaliser un process métier" },
    { value: "GENERATE_LEADS", label: "Activer un tunnel business" },
    { value: "PRESENCE", label: "Valider un MVP" },
    { value: "TO_CONFIRM", label: "À confirmer" },
  ],
};

export function DiscoverySection({
  projectType,
  changeProjectType,
  budgetBand,
  setBudgetBand,
  manualBudgetMax,
  setManualBudgetMax,
  budgetBandEffective,
  clientKnowledge,
  setClientKnowledge,
  primaryGoal,
  setPrimaryGoal,
  ambitionLevel,
  setAmbitionLevel,
  targetTimeline,
  setTargetTimeline,
  commerceModel,
  trafficLevel,
  dataSensitivity,
  scalabilityLevel,
  needsEditing,
  editingMode,
  editorialPushOwner,
  qType,
  qBudget,
  qKnowledge,
  qGoal,
  qAmbition,
  qTimeline,
}: DiscoverySectionProps) {
  const canAskBudget = Boolean(projectType);
  const canAskKnowledge = canAskBudget && budgetBandEffective !== "TO_CONFIRM";
  const canAskGoal = canAskKnowledge && clientKnowledge !== "TO_CONFIRM";
  const canAskAmbition = canAskGoal && primaryGoal !== "TO_CONFIRM";
  const canAskTimeline = canAskAmbition && ambitionLevel !== "TO_CONFIRM";

  const suggestedRecommendations = suggestModuleRecommendationsFromDiscovery({
    projectType,
    primaryGoal,
    ambitionLevel,
    budgetBand: budgetBandEffective,
    needsEditing,
    editingMode,
    commerceModel,
    trafficLevel,
    dataSensitivity,
    scalabilityLevel,
  });
  const suggestedModuleIds = suggestedRecommendations.map((item) => item.id);
  const suggestedModuleLabels = suggestedRecommendations
    .map((item) => MODULE_CATALOG.find((module) => module.id === item.id)?.name)
    .filter((value): value is string => Boolean(value));

  const discoveryInsights = deriveDiscoveryInsights({
    projectType,
    budgetBand: budgetBandEffective,
    clientKnowledge,
    primaryGoal,
    ambitionLevel,
    targetTimeline,
    needsEditing,
    editingMode,
    editorialPushOwner,
    suggestedModuleIds,
  });

  const lot1Labels = discoveryInsights.lot1ModuleIds
    .map((id) => MODULE_CATALOG.find((module) => module.id === id)?.name)
    .filter((value): value is string => Boolean(value));
  const lot2Labels = discoveryInsights.lot2ModuleIds
    .map((id) => MODULE_CATALOG.find((module) => module.id === id)?.name)
    .filter((value): value is string => Boolean(value));

  return (
    <>
      <FieldSelect
        label={`Question ${qType} · Type de projet`}
        value={projectType}
        onChange={(value) => changeProjectType(value as ProjectTypeValue)}
        options={PROJECT_TYPE_OPTIONS.map((opt) => ({
          value: opt.value,
          label: opt.label,
        }))}
        placeholder="Sélectionner le type"
        tooltip="Catégorie fonctionnelle utilisée pour cadrer la qualification initiale."
        helpText="Le type sélectionné influence les parcours, contraintes et estimations affichés ensuite."
      />

      {canAskBudget && (
        <div className="space-y-3">
          <FieldSelect
            label={`Question ${qBudget} · Budget maximum (HT)`}
            value={budgetBand}
            onChange={(value) => setBudgetBand(value as WizardContextType["budgetBand"])}
            options={[
              { value: "UNDER_1200", label: "Moins de 1 200 € (très contraint)" },
              { value: "UP_TO_1800", label: "Jusqu’à 1 800 €" },
              { value: "UP_TO_3500", label: "Jusqu’à 3 500 €" },
              { value: "UP_TO_7000", label: "Jusqu’à 7 000 €" },
              { value: "OVER_7000", label: "Plus de 7 000 €" },
              { value: "TO_CONFIRM", label: "À confirmer" },
            ]}
            tooltip="Budget plafond assumé par le client pour cadrer la proposition réaliste."
            helpText="Le budget n’influence pas le CI, mais conditionne fortement le lotissement : sous 1 200 €, la mise en ligne + socle CMS consomment vite le plafond."
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Montant manuel (€ HT)</Label>
              {manualBudgetMax.trim() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setManualBudgetMax("")}
                >
                  Réinitialiser au calcul auto
                </Button>
              )}
            </div>
            <Input
              type="number"
              min={0}
              step={100}
              value={manualBudgetMax}
              onChange={(event) => setManualBudgetMax(event.target.value)}
              placeholder="Ex: 2600"
            />
            <p className="text-xs text-muted-foreground">
              Optionnel. Si renseigné, ce montant pilote la bande budget utilisée pour le pré-cadrage.
            </p>
            <p
              className={`text-xs ${
                manualBudgetMax.trim()
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {manualBudgetMax.trim() ? "Mode manuel actif." : "Mode auto actif."}
            </p>
          </div>
        </div>
      )}

      {projectType === "APP" && budgetBandEffective === "UNDER_1200" && (
        <InlineHint>
          Avec un budget &lt; 1 200 €, privilégier une requalification Vitrine/Blog en CMS monolithique économique (lot 1 minimal).
        </InlineHint>
      )}

      {canAskKnowledge && (
        <FieldSelect
          label={`Question ${qKnowledge} · Niveau de connaissance numérique du client`}
          value={clientKnowledge}
          onChange={(value) => setClientKnowledge(value as WizardContextType["clientKnowledge"])}
          options={[
            { value: "NONE", label: "Aucune" },
            { value: "BASIC", label: "Basique" },
            { value: "INTERMEDIATE", label: "Intermédiaire" },
            { value: "ADVANCED", label: "Avancée" },
            { value: "TO_CONFIRM", label: "À confirmer" },
          ]}
          tooltip="Permet d’ajuster le niveau d’autonomie attendu et le besoin d’accompagnement."
          helpText="Exemple: profil non technique => process plus guidé et gouvernance simplifiée."
        />
      )}

      {canAskGoal && projectType && (
        <FieldSelect
          label={`Question ${qGoal} · Objectif principal`}
          value={primaryGoal}
          onChange={(value) => setPrimaryGoal(value as WizardContextType["primaryGoal"])}
          options={goalOptionsByProjectType[projectType]}
          tooltip="Question centrale pour prioriser le périmètre MVP et les arbitrages de livraison."
          helpText="On vise un objectif prioritaire unique pour éviter un périmètre dispersé."
        />
      )}

      {canAskAmbition && (
        <FieldSelect
          label={`Question ${qAmbition} · Ambition à 12 mois`}
          value={ambitionLevel}
          onChange={(value) => setAmbitionLevel(value as WizardContextType["ambitionLevel"])}
          options={[
            { value: "KEEP_SIMPLE", label: "Rester simple et stable" },
            { value: "GROW_FEATURES", label: "Ajouter progressivement des fonctionnalités" },
            { value: "SCALE_TRAFFIC", label: "Monter en trafic/conversion" },
            { value: "PREPARE_PLATFORM", label: "Préparer une logique plateforme" },
            { value: "TO_CONFIRM", label: "À confirmer" },
          ]}
          tooltip="Aide à décider si l’on livre un socle minimal ou un socle préparé à l’évolution."
          helpText="Cette ambition nourrit la stratégie de lotissement et de roadmap."
        />
      )}

      {canAskTimeline && (
        <FieldSelect
          label={`Question ${qTimeline} · Délai cible`}
          value={targetTimeline}
          onChange={(value) => setTargetTimeline(value as WizardContextType["targetTimeline"])}
          options={[
            { value: "UNDER_1_MONTH", label: "Moins d’un mois" },
            { value: "ONE_TO_TWO_MONTHS", label: "1 à 2 mois" },
            { value: "TWO_TO_FOUR_MONTHS", label: "2 à 4 mois" },
            { value: "FLEXIBLE", label: "Flexible" },
            { value: "TO_CONFIRM", label: "À confirmer" },
          ]}
          tooltip="Permet de calibrer le lot 1 réaliste et le niveau de priorisation."
          helpText="Un délai court implique un périmètre plus focalisé pour éviter la dérive."
        />
      )}

      {canAskGoal && suggestedModuleLabels.length > 0 && (
        <div className="space-y-2 rounded-lg border border-dashed p-3">
          <Label>Modules suggérés (pré-cadrage)</Label>
          <InlineHint>
            Suggestions automatiques selon objectif, ambition et budget. Validation finale à l’étape Modules.
          </InlineHint>
          <div className="flex flex-wrap gap-2">
            {suggestedModuleLabels.map((label) => (
              <Badge key={label} variant="secondary" className="text-[11px]">
                {label}
              </Badge>
            ))}
          </div>
          <div className="space-y-1 text-[10px] text-muted-foreground">
            {suggestedRecommendations.map((item) => {
              const moduleName = MODULE_CATALOG.find((module) => module.id === item.id)?.name;
              if (!moduleName) return null;
              return (
                <p key={item.id}>
                  <span className="font-medium text-foreground">{moduleName}</span>
                  {" · "}
                  {item.reasons.slice(0, 2).join(" · ")}
                </p>
              );
            })}
          </div>
          <InlineHint>Posture recommandée : {discoveryInsights.posture}</InlineHint>

          {discoveryInsights.warnings.length > 0 && (
            <div className="space-y-1 rounded-md border border-amber-500/40 bg-amber-500/5 p-2 text-[11px] text-amber-700 dark:text-amber-300">
              <p className="font-medium">Alertes prioritaires</p>
              {discoveryInsights.warnings.map((warning) => (
                <p key={warning}>• {warning}</p>
              ))}
            </div>
          )}

          {(lot1Labels.length > 0 || lot2Labels.length > 0) && (
            <div className="grid gap-2 text-[11px] sm:grid-cols-2">
              <div className="rounded-md border p-2">
                <p className="font-medium">Lot 1 · Essentiel</p>
                <p className="text-muted-foreground">
                  {lot1Labels.length > 0 ? lot1Labels.join(" · ") : "À définir"}
                </p>
              </div>
              <div className="rounded-md border p-2">
                <p className="font-medium">Lot 2 · Évolutions</p>
                <p className="text-muted-foreground">
                  {lot2Labels.length > 0 ? lot2Labels.join(" · ") : "Non prioritaire"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
