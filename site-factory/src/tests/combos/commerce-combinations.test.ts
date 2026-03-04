import { describe, expect, it } from "vitest";
import {
  MODULES,
  isModuleCompatible,
  type ProjectType,
  type Stack,
} from "@/lib/offers";

const commerceModule = MODULES.find((mod) => mod.categories.includes("commerce"));
if (!commerceModule) {
  throw new Error("Test fixture: aucun module 'commerce' trouvé dans le catalogue.");
}

const ECOM_STACK: Stack = "WOOCOMMERCE";

describe("Combinaisons commerce / type de projet", () => {
  it("autorise les modules commerce pour un projet e-commerce", () => {
    expect(
      isModuleCompatible(commerceModule.id, ECOM_STACK, "ECOMMERCE" satisfies ProjectType),
    ).toBe(true);
  });

  it("autorise les modules commerce pour un projet vitrine/blog qui veut une boutique", () => {
    expect(
      isModuleCompatible(commerceModule.id, ECOM_STACK, "VITRINE_BLOG" satisfies ProjectType),
    ).toBe(true);
  });

  it("bloque les modules commerce pour les projets app custom", () => {
    expect(isModuleCompatible(commerceModule.id, ECOM_STACK, "APP_CUSTOM")).toBe(false);
  });
});
