"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InlineHint } from "@/components/shared/InlineHint";
import { SupportBadge } from "@/components/shared/SupportBadge";
import { ShieldCheck, AlertTriangle, Gauge } from "lucide-react";
import { formatEur } from "@/lib/currency";
import {
	FRONTEND_IMPLEMENTATIONS,
	IMPLEMENTATION_OPTIONS,
	IMPLEMENTATION_SAAS_MONTHLY_ESTIMATES,
	SUPPORT_BADGE_LABELS,
	isImplementationLiveEligible,
	resolveCmsIdFromImplementation,
} from "@/lib/project-choices";
import {
	computeStackMultiplier,
	getMultiplierLabel,
} from "@/lib/stack-pricing";
import {
	BACKEND_FAMILY_LABELS,
	CATEGORY_COLORS,
	CATEGORY_LABELS,
	CATEGORY_SHORT,
	MAINTENANCE_LABELS,
	MAINTENANCE_PRICES,
	MODULE_CATALOG,
	SPEC_MODULES,
	estimatePluginSubscriptions,
	estimateQuoteFromSpec,
} from "@/lib/referential";
import type { Category as SpecCategory } from "@/lib/referential/spec/types";
import { HOSTING_TARGET_LABELS } from "@/lib/validators";
import { MARKET_GUARDRAILS, MARKET_TYPE_LABELS } from "@/lib/market-guardrails";
import { useWizard } from "../logic/WizardProvider";
import { suggestModuleRecommendationsFromDiscovery } from "../logic/module-suggestions";
import { deriveDiscoveryInsights } from "../logic/discovery-insights";
import { getDiscoveryLabels } from "../logic/discovery-labels";

export function QualificationSidebar() {
	const {
		projectType,
		qualificationProjectType,
		offerProjectType,
		needsEditing,
		editingMode,
		editingFrequency,
		editorialPushOwner,
		includeOnboardingPack,
		includeMonthlyEditorialValidation,
		includeUnblockInterventions,
		clientAccessPolicy,
		budgetBandEffective,
		manualBudgetMax,
		clientKnowledge,
		primaryGoal,
		ambitionLevel,
		targetTimeline,
		commerceModel,
		trafficLevel,
		dataSensitivity,
		scalabilityLevel,
		techStack,
		wpHeadless,
		hostingTarget,
		hostingTargetBack,
		hostingTargetFront,
		hostingSelectionMode,
		projectImplementation,
		projectImplementationLabel,
		projectFrontendImplementation,
		projectFrontendImplementationLabel,
		selectedModules,
		qualification,
		backendMode,
		backendFamily,
		backendOpsHeavy,
		backendMultiplier,
	} = useWizard();

	const {
		editingModeLabel,
		editingFrequencyLabel,
		pushOwnerLabel,
		clientAccessPolicyLabel,
		budgetBandLabel,
		clientKnowledgeLabel,
		primaryGoalLabel,
		ambitionLevelLabel,
		targetTimelineLabel,
	} = getDiscoveryLabels({
		editingMode,
		editingFrequency,
		editorialPushOwner,
		clientAccessPolicy,
		budgetBand: budgetBandEffective,
		clientKnowledge,
		primaryGoal,
		ambitionLevel,
		targetTimeline,
	});
	const extraSetupMin = (includeOnboardingPack ? 300 : 0) + (includeUnblockInterventions ? 90 : 0);
	const extraSetupMax = (includeOnboardingPack ? 500 : 0) + (includeUnblockInterventions ? 150 : 0);
	const extraMonthlyMin = includeMonthlyEditorialValidation ? 120 : 0;
	const extraMonthlyMax = includeMonthlyEditorialValidation ? 250 : 0;

	const implementationSupport = projectImplementation
		? IMPLEMENTATION_OPTIONS.find((item) => item.value === projectImplementation)?.support
		: null;
	const implementationLiveEligible = projectImplementation
		? isImplementationLiveEligible(projectImplementation)
		: false;

	if (!qualification || !projectType) {
		const message = !projectType
			? "Démarrage de la qualification après première réponse du questionnaire."
			: projectImplementation && !implementationLiveEligible
				? "Qualification désactivée (implémentation non supportée)."
				: "Qualification indisponible pour la sélection courante.";
		return (
			<Card className="border-dashed">
				<CardContent className="py-8 text-center text-sm text-muted-foreground">
					<Gauge className="mx-auto mb-2 size-6 opacity-40" />
					{message}
					<p className="mt-2 text-xs text-muted-foreground">
						Le live reste synchronisé avec la progression questionnaire → cadrage technique → modules.
					</p>
				</CardContent>
			</Card>
		);
	}

	const multiplier =
		techStack &&
		computeStackMultiplier(
			qualificationProjectType ?? projectType,
			techStack,
			wpHeadless && techStack === "WORDPRESS",
		);
	const offerLabel =
		offerProjectType === "VITRINE_BLOG"
			? "Vitrine / Blog"
			: offerProjectType === "ECOMMERCE"
				? "E-commerce"
				: offerProjectType === "APP_CUSTOM"
					? "App custom"
					: null;

	const implementationLabel =
		projectImplementation === "OTHER" && projectImplementationLabel
			? projectImplementationLabel
			: projectImplementation
				? IMPLEMENTATION_OPTIONS.find((item) => item.value === projectImplementation)?.label
				: null;
	const frontLabel = projectFrontendImplementation
		? projectFrontendImplementation === "OTHER" && projectFrontendImplementationLabel
			? projectFrontendImplementationLabel
			: FRONTEND_IMPLEMENTATIONS.find((item) => item.value === projectFrontendImplementation)?.label
		: null;
	const showBackend = projectType === "APP";
	const backendLabel =
		backendMode === "SEPARATE"
			? backendFamily
				? BACKEND_FAMILY_LABELS[backendFamily]
				: "À confirmer"
			: "Full‑stack intégré";
	const backendSuffix =
		backendMode === "SEPARATE" && backendOpsHeavy ? " + ops lourds" : "";
	const backendCoefLabel =
		backendMode === "SEPARATE" && backendFamily && backendMultiplier !== 1
			? `×${backendMultiplier.toFixed(2).replace(/\.?0+$/, "")}`
			: null;
	const effectiveProjectType = qualificationProjectType ?? projectType;
	const marketRule = MARKET_GUARDRAILS[effectiveProjectType];
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
	const suggestedSelectedCount = suggestedModuleIds.filter((id) => selectedModules.has(id as never)).length;
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

	const toSpecCategory = (category: string): SpecCategory | null => {
		const values: SpecCategory[] = ["CAT0", "CAT1", "CAT2", "CAT3", "CAT4"];
		return values.includes(category as SpecCategory) ? (category as SpecCategory) : null;
	};

	const estimate = (() => {
		const category = toSpecCategory(qualification.finalCategory);
		if (!category) return null;
		try {
			return estimateQuoteFromSpec({
				category,
				moduleIds: Array.from(selectedModules),
			});
		} catch {
			return null;
		}
	})();

	const belowMarketFloor = estimate
		? estimate.totalSetup.min < marketRule.floor
		: qualification.budget.grandTotal < marketRule.floor;

	const formatRange = (min: number, max: number, suffix = "") => {
		if (min === max) return `${formatEur(min)}${suffix}`;
		return `${formatEur(min)} à ${formatEur(max)}${suffix}`;
	};

	const specModulesMin = estimate
		? Math.max(0, estimate.totalSetup.min - estimate.baseSetup.min - estimate.annexFees.deploymentSetupFee.oneTime)
		: 0;
	const specModulesMax = estimate
		? Math.max(0, estimate.totalSetup.max - estimate.baseSetup.max - estimate.annexFees.deploymentSetupFee.oneTime)
		: 0;
	const clientSetupTariff = qualification.budget.grandTotal;
	const maintenanceMonthly =
		estimate?.maintenance.monthly ??
		(Number(MAINTENANCE_PRICES[qualification.maintenance].replace(/\D+/g, "")) || 0);
	const hasSaasImplementation = implementationSupport === "SAAS";
	const saasImplementationEstimate = projectImplementation
		? IMPLEMENTATION_SAAS_MONTHLY_ESTIMATES[projectImplementation]
		: undefined;
	const cmsId = resolveCmsIdFromImplementation(projectImplementation, projectImplementationLabel);
	const selectedFeatureIds = Array.from(selectedModules)
		.flatMap((moduleId) => SPEC_MODULES.find((moduleItem) => moduleItem.id === moduleId)?.featureIds ?? []);
	const pluginEstimate = cmsId
		? estimatePluginSubscriptions({ cmsId, featureIds: selectedFeatureIds })
		: null;
	const budgetCapByBand: Record<string, number | null> = {
		UNDER_1200: 1200,
		UP_TO_1800: 1800,
		UP_TO_3500: 3500,
		UP_TO_7000: 7000,
		OVER_7000: null,
		TO_CONFIRM: null,
	};
	const manualBudgetCap = Number(manualBudgetMax);
	const hasManualBudgetCap = Number.isFinite(manualBudgetCap) && manualBudgetCap > 0;
	const budgetCap = hasManualBudgetCap
		? manualBudgetCap
		: budgetCapByBand[budgetBandEffective] ?? null;
	const setupMin = clientSetupTariff;
	const setupMax = clientSetupTariff;
	const budgetStatus = (() => {
		if (budgetCap == null) return null;
		if (setupMin > budgetCap) {
			return {
				label: `Hors budget client (dépassement min ${formatEur(setupMin - budgetCap)})`,
				className: "text-amber-600 dark:text-amber-400",
			};
		}
		if (setupMax <= budgetCap) {
			return {
				label: "Compatible avec le budget client",
				className: "text-emerald-600 dark:text-emerald-400",
			};
		}
		return {
			label: `Zone de risque (jusqu’à ${formatEur(setupMax - budgetCap)} au-dessus du budget)`,
			className: "text-amber-600 dark:text-amber-400",
		};
	})();

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-sm">Qualification live</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<InlineHint>
					Mise à jour automatique et continue selon questionnaire, cadrage technique et modules.
				</InlineHint>

				<div className="flex items-center justify-between">
					<span className="text-xs text-muted-foreground">Catégorie</span>
					<Badge
						className={CATEGORY_COLORS[qualification.finalCategory]}
					>
						{CATEGORY_LABELS[qualification.finalCategory]}
					</Badge>
				</div>

				{offerLabel && (
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>Offre</span>
						<span className="font-medium text-foreground">{offerLabel}</span>
					</div>
				)}

				{qualification.ci ? (
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<span>Complexity Index</span>
						<span className="font-medium text-foreground">
							{qualification.ci.score} ({CATEGORY_SHORT[qualification.ci.category]})
						</span>
					</div>
				) : null}

				{qualification.wasRequalified && (
					<InlineHint className="text-[10px] text-amber-600 dark:text-amber-400">
						<AlertTriangle className="size-3" />
						{CATEGORY_SHORT[qualification.initialCategory]} →{" "}
						{CATEGORY_SHORT[qualification.finalCategory]}
					</InlineHint>
				)}

				<div className="space-y-1.5 text-xs">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Base</span>
						<span>{estimate ? formatRange(estimate.baseSetup.min, estimate.baseSetup.max) : formatEur(qualification.budget.base)}</span>
					</div>
					{(estimate ? estimate.modules.length > 0 : qualification.budget.modulesTotal > 0) && (
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								Modules ({String(selectedModules.size)})
							</span>
							<span>
								+ {estimate ? formatRange(specModulesMin, specModulesMax) : formatEur(qualification.budget.modulesTotal)}
							</span>
						</div>
					)}
					{(estimate ? estimate.annexFees.deploymentSetupFee.oneTime > 0 : qualification.budget.deployCost > 0) && (
						<div className="flex justify-between">
							<span className="text-muted-foreground">Mise en prod.</span>
							<span>+ {estimate ? formatEur(estimate.annexFees.deploymentSetupFee.oneTime) : formatEur(qualification.budget.deployCost)}</span>
						</div>
					)}
					<div className="flex justify-between border-t pt-1 font-medium">
						<span>Tarif projet (setup)</span>
						<span>{formatEur(clientSetupTariff)}</span>
					</div>
					<div className="flex justify-between text-amber-600 dark:text-amber-400">
						<span>Maintenance mensuelle agence</span>
						<span>{formatEur(maintenanceMonthly)}/mois</span>
					</div>
					{budgetStatus && <p className={`text-[10px] ${budgetStatus.className}`}>{budgetStatus.label}</p>}
					{estimate && (
						<div className="space-y-1 border-t pt-1 text-muted-foreground">
							<p className="text-[10px] font-medium text-foreground">Coûts tiers (hors prestation agence)</p>
							<div className="flex justify-between">
								<span>Domaine (annuel)</span>
								<span>{formatRange(estimate.annexFees.domainCostRange.yearlyMin, estimate.annexFees.domainCostRange.yearlyMax, "/an")}</span>
							</div>
							<div className="flex justify-between">
								<span>Hébergement (mensuel)</span>
								<span>{formatRange(estimate.annexFees.hostingCostRange.monthlyMin, estimate.annexFees.hostingCostRange.monthlyMax, "/mois")}</span>
							</div>
							<div className="flex justify-between">
								<span>Email (mensuel)</span>
								<span>{formatRange(estimate.annexFees.emailProviderCostRange.monthlyMin, estimate.annexFees.emailProviderCostRange.monthlyMax, "/mois")}</span>
							</div>
							<div className="flex justify-between">
								<span>Stockage (mensuel)</span>
								<span>{formatRange(estimate.annexFees.storageCostRange.monthlyMin, estimate.annexFees.storageCostRange.monthlyMax, "/mois")}</span>
							</div>
							{hasSaasImplementation && (
								<>
									<div className="flex justify-between">
										<span>Abonnement SaaS (mensuel)</span>
										<span>
											{saasImplementationEstimate
												? formatRange(
													saasImplementationEstimate.min,
													saasImplementationEstimate.max,
													"/mois",
												)
												: "À chiffrer"}
										</span>
									</div>
									<p className="text-[10px] text-amber-600 dark:text-amber-400">
										{saasImplementationEstimate?.notes ??
											`Abonnement SaaS (${implementationLabel ?? "éditeur"}) à ajouter (hors apps/comissions).`}
									</p>
								</>
							)}
							{pluginEstimate && pluginEstimate.plugins.length > 0 && (
								<>
									<div className="flex justify-between">
										<span>Plugins/apps recommandés</span>
										<span>{String(pluginEstimate.plugins.length)}</span>
									</div>
									<div className="flex justify-between">
										<span>Plugins/apps payants potentiels</span>
										<span>{String(pluginEstimate.paidOrMixedCount)}</span>
									</div>
									{pluginEstimate.monthlyMax > 0 && (
										<div className="flex justify-between">
											<span>Plugins/apps (mensuel)</span>
											<span>{formatRange(pluginEstimate.monthlyMin, pluginEstimate.monthlyMax, "/mois")}</span>
										</div>
									)}
									{pluginEstimate.unknownPricingCount > 0 && (
										<p className="text-[10px] text-amber-600 dark:text-amber-400">
											{String(pluginEstimate.unknownPricingCount)} plugin(s)/app(s) payant(s) à chiffrer précisément.
										</p>
									)}
								</>
							)}
						</div>
					)}
				</div>

				<div className="rounded-md border border-dashed p-2 text-[10px] space-y-1">
					<p className="font-medium">Repères marché local</p>
					<div className="flex justify-between text-muted-foreground">
						<span>Type / CI usuel</span>
						<span>
							{MARKET_TYPE_LABELS[effectiveProjectType]} · {marketRule.ciRange}
						</span>
					</div>
					<div className="flex justify-between text-muted-foreground">
						<span>Catégorie cible</span>
						<span>{marketRule.categoryRange}</span>
					</div>
					<div className="flex justify-between text-muted-foreground">
						<span>Plancher création</span>
						<span>{formatEur(marketRule.floor)}</span>
					</div>
					<div className="flex justify-between text-muted-foreground">
						<span>Repère création</span>
						<span>{marketRule.creationRange}</span>
					</div>
					<p
						className={
							belowMarketFloor
								? "text-amber-600 dark:text-amber-400"
								: "text-emerald-600 dark:text-emerald-400"
						}
					>
						{belowMarketFloor
							? "Alerte tarifaire : budget sous le minimum recommandé."
							: "Minimum recommandé respecté."}
					</p>
				</div>

				<div className="border-t pt-2 space-y-1.5 text-xs">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Budget max</span>
						<span>{budgetBandLabel}</span>
					</div>
					{manualBudgetMax.trim() && (
						<div className="flex justify-between">
							<span className="text-muted-foreground">Budget manuel</span>
							<span>{formatEur(Number(manualBudgetMax))}</span>
						</div>
					)}
					<div className="flex justify-between">
						<span className="text-muted-foreground">Maturité client</span>
						<span>{clientKnowledgeLabel}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Objectif principal</span>
						<span>{primaryGoalLabel}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Ambition 12 mois</span>
						<span>{ambitionLevelLabel}</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Délai cible</span>
						<span>{targetTimelineLabel}</span>
					</div>
					{suggestedModuleLabels.length > 0 && (
						<div className="space-y-1 pt-1">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Modules suggérés</span>
								<span>
									{suggestedSelectedCount}/{suggestedModuleLabels.length}
								</span>
							</div>
							<p className="text-[10px] text-muted-foreground">
								{suggestedModuleLabels.join(" · ")}
							</p>
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
						</div>
					)}
					{(lot1Labels.length > 0 || lot2Labels.length > 0) && (
						<div className="space-y-1 pt-1 text-[10px] text-muted-foreground">
							<p className="font-medium text-foreground">Lotissement recommandé</p>
							<p>Lot 1 : {lot1Labels.length > 0 ? lot1Labels.join(" · ") : "À définir"}</p>
							<p>Lot 2 : {lot2Labels.length > 0 ? lot2Labels.join(" · ") : "Non prioritaire"}</p>
						</div>
					)}
					{discoveryInsights.warnings.length > 0 && (
						<div className="space-y-1 rounded-md border border-amber-500/40 bg-amber-500/5 p-2 text-[10px] text-amber-700 dark:text-amber-300">
							<p className="font-medium">Alertes prioritaires</p>
							{discoveryInsights.warnings.map((warning) => (
								<p key={warning}>• {warning}</p>
							))}
						</div>
					)}

					<div className="flex justify-between">
						<span className="text-muted-foreground">Édition continue</span>
						<span>{needsEditing ? "Oui" : "Non"}</span>
					</div>
					{needsEditing && (
						<>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Mode d’édition</span>
								<span>{editingModeLabel}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Fréquence</span>
								<span>{editingFrequencyLabel}</span>
							</div>
							{editingMode === "GIT_MDX" && (
								<>
									<div className="flex justify-between">
										<span className="text-muted-foreground">Publication</span>
										<span>{pushOwnerLabel}</span>
									</div>
									{editorialPushOwner === "CLIENT" && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">Accès client</span>
											<span>{clientAccessPolicyLabel}</span>
										</div>
									)}
								</>
							)}
						</>
					)}

					<div className="flex justify-between">
						<span className="text-muted-foreground">Implémentation</span>
						<span className="font-medium">
							{implementationLabel ?? "—"}
						</span>
					</div>
					{implementationSupport && (
						<div className="flex justify-between">
							<span className="text-muted-foreground">Support</span>
							<SupportBadge>{SUPPORT_BADGE_LABELS[implementationSupport]}</SupportBadge>
						</div>
					)}
					{projectImplementation && (
						<div className="flex justify-between">
							<span className="text-muted-foreground">Live</span>
							<span>
								{implementationLiveEligible
									? implementationSupport === "SAAS"
										? "Actif (SaaS inclus)"
										: "Actif"
									: "Désactivé"}
							</span>
						</div>
					)}
					{frontLabel && (
						<div className="flex justify-between">
							<span className="text-muted-foreground">Front</span>
							<span>{frontLabel}</span>
						</div>
					)}
					{showBackend && (
						<div className="flex justify-between">
							<span className="text-muted-foreground">Backend</span>
							<span>
								{backendLabel}
								{backendSuffix}
								{backendCoefLabel ? ` (${backendCoefLabel})` : ""}
							</span>
						</div>
					)}
					{techStack && multiplier && multiplier !== 1 && (
						<div className="flex justify-between">
							<span className="text-muted-foreground">Coeff.</span>
							<span>
								{getMultiplierLabel(
									qualificationProjectType ?? projectType,
									techStack,
									wpHeadless && techStack === "WORDPRESS",
								)}
							</span>
						</div>
					)}
					<div className="flex justify-between">
						<span className="text-muted-foreground">Hébergement</span>
						<span>{HOSTING_TARGET_LABELS[hostingTarget]}</span>
					</div>
					{hostingSelectionMode !== "SINGLE" && hostingSelectionMode !== "NONE" && (
						<>
							{hostingSelectionMode === "SPLIT" && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">Back</span>
									<span>{hostingTargetBack ? HOSTING_TARGET_LABELS[hostingTargetBack] : "—"}</span>
								</div>
							)}
							<div className="flex justify-between">
								<span className="text-muted-foreground">Front</span>
								<span>{hostingTargetFront ? HOSTING_TARGET_LABELS[hostingTargetFront] : "—"}</span>
							</div>
						</>
					)}
				</div>

				{needsEditing && editingMode === "GIT_MDX" ? (
					<div className="space-y-2">
						<InlineHint className="text-[10px] text-muted-foreground">
							Le mode d’édition MDX/Git n’ajuste pas le CI à lui seul ; le score CI dépend du périmètre fonctionnel et des contraintes.
						</InlineHint>
						{(includeOnboardingPack || includeMonthlyEditorialValidation || includeUnblockInterventions) && (
							<div className="rounded-md border border-dashed p-2 text-[10px] text-muted-foreground space-y-1">
								<p className="font-medium text-foreground">Coûts en sus (hors budget projet)</p>
								{(includeOnboardingPack || includeUnblockInterventions) && (
									<p>
										Ponctuel estimatif : {formatEur(extraSetupMin)} à {formatEur(extraSetupMax)}
									</p>
								)}
								{includeMonthlyEditorialValidation && (
									<p>
										Mensuel estimatif : {formatEur(extraMonthlyMin)} à {formatEur(extraMonthlyMax)} / mois
									</p>
								)}
							</div>
						)}
					</div>
				) : null}

				<div className="border-t pt-2 flex items-center justify-between text-xs">
					<div className="flex items-center gap-1 text-muted-foreground">
						<ShieldCheck className="size-3" />
						Maintenance
					</div>
					<div className="text-right">
						<p className="font-medium">
							{MAINTENANCE_LABELS[qualification.maintenance]}
						</p>
						<p className="text-[10px] text-muted-foreground">
							{MAINTENANCE_PRICES[qualification.maintenance]}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
