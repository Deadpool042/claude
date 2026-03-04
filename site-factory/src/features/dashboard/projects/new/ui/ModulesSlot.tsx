"use client";

import { Badge } from "@/components/ui/badge";
import { InlineHint } from "@/components/shared/InlineHint";
import { StepCard } from "@/components/shared/StepCard";
import { MODULE_CATALOG } from "@/lib/referential";
import { Layers } from "lucide-react";
import { useWizard } from "../logic/WizardProvider";

export function ModulesSlot() {
	const {
		offerProjectType,
		compatibleModuleIds,
		selectedModules,
		mandatoryModuleIds,
		includedModuleIds,
	} = useWizard();

	if (!offerProjectType) return null;

	const selectedSet = new Set(selectedModules);
	const mandatorySet = new Set(mandatoryModuleIds);
	const includedSet = new Set(includedModuleIds);
	const visibleModules = MODULE_CATALOG.filter((mod) =>
		compatibleModuleIds.includes(mod.id),
	);

	return (
		<StepCard
			title="Détails modules"
			icon={Layers}
			description="Contenu et périmètre des modules compatibles."
			className="max-h-[70vh] overflow-hidden"
			headerClassName="pb-3"
			contentClassName="space-y-3 overflow-auto pr-2"
		>
				{offerProjectType === "VITRINE_BLOG" || visibleModules.length === 0 ? (
					<InlineHint className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
						Aucun module disponible pour cette offre.
					</InlineHint>
				) : (
					visibleModules.map((mod) => (
						<div key={mod.id} className="rounded-lg border p-3 space-y-2">
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-sm font-medium">{mod.name}</span>
								{selectedSet.has(mod.id) && (
									<Badge variant="outline" className="text-[9px] px-1 py-0">
										sélectionné
									</Badge>
								)}
								{mandatorySet.has(mod.id) && (
									<Badge variant="destructive" className="text-[9px] px-1 py-0">
										obligatoire
									</Badge>
								)}
								{!mandatorySet.has(mod.id) && includedSet.has(mod.id) && (
									<Badge variant="secondary" className="text-[9px] px-1 py-0">
										inclus
									</Badge>
								)}
							</div>
							<p className="text-xs text-muted-foreground">{mod.description}</p>
							{mod.details && mod.details.length > 0 ? (
								<ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
									{mod.details.map((item) => (
										<li key={item}>{item}</li>
									))}
								</ul>
							) : null}
						</div>
					))
				)}
		</StepCard>
	);
}
