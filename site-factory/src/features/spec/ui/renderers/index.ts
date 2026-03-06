import type { SpecRendererProps } from "../../logic/spec-types";
import { CapabilityMatrixRenderer } from "./CapabilityMatrixRenderer";
import { FeaturesRenderer } from "./FeaturesRenderer";
import { ModulesRenderer } from "./ModulesRenderer";
import { PluginsRenderer } from "./PluginsRenderer";
import { DecisionRulesRenderer } from "./DecisionRulesRenderer";
import { CommercialRenderer } from "./CommercialRenderer";
import { StackProfilesRenderer } from "./StackProfilesRenderer";
import { InfraServicesRenderer } from "./InfraServicesRenderer";

export {
  CapabilityMatrixRenderer,
  FeaturesRenderer,
  ModulesRenderer,
  PluginsRenderer,
  DecisionRulesRenderer,
  CommercialRenderer,
  StackProfilesRenderer,
  InfraServicesRenderer,
};

/** Check if a spec file should use a specialized renderer */
export function getSpecializedRenderer(
  specFile: string,
): ((props: SpecRendererProps) => React.ReactNode) | null {
  switch (specFile) {
    case "capability-matrix.json":
      return CapabilityMatrixRenderer;
    case "features.json":
      return FeaturesRenderer;
    case "modules.json":
      return ModulesRenderer;
    case "plugins.json":
      return PluginsRenderer;
    case "decision-rules.json":
      return DecisionRulesRenderer;
    case "commercial.json":
      return CommercialRenderer;
    case "stack-profiles.json":
      return StackProfilesRenderer;
    case "infra-services.json":
      return InfraServicesRenderer;
    default:
      return null;
  }
}
