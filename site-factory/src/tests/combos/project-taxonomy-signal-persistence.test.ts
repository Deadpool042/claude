import { describe, expect, it } from "vitest";
import { buildProjectCreateArgs } from "@/lib/projects";
import { createProjectSchema } from "@/lib/validators";

describe("project taxonomy signal persistence", () => {
  it("writes dedicated taxonomy_signal on create when explicit signal is provided", () => {
    const data = createProjectSchema.parse({
      name: "Projet business",
      clientId: "cl_test",
      type: "VITRINE",
      taxonomySignal: "SITE_BUSINESS",
    });

    const built = buildProjectCreateArgs({
      formData: new FormData(),
      slug: "projet-business",
      port: 3101,
      data,
    });

    const qualificationInput = built.createArgs.data.qualification;
    expect(qualificationInput).toBeDefined();

    if (!qualificationInput || !("create" in qualificationInput)) {
      throw new Error("Missing qualification.create payload");
    }

    const createInput = qualificationInput.create;
    if (Array.isArray(createInput)) {
      throw new Error("Unexpected qualification.create payload shape");
    }

    expect(createInput.taxonomySignal).toBe("SITE_BUSINESS");
  });

  it("stores null in dedicated taxonomy_signal when no explicit signal is provided", () => {
    const data = createProjectSchema.parse({
      name: "Projet vitrine",
      clientId: "cl_test",
      type: "VITRINE",
    });

    const built = buildProjectCreateArgs({
      formData: new FormData(),
      slug: "projet-vitrine",
      port: 3102,
      data,
    });

    const qualificationInput = built.createArgs.data.qualification;
    expect(qualificationInput).toBeDefined();

    if (!qualificationInput || !("create" in qualificationInput)) {
      throw new Error("Missing qualification.create payload");
    }

    const createInput = qualificationInput.create;
    if (Array.isArray(createInput)) {
      throw new Error("Unexpected qualification.create payload shape");
    }

    expect(createInput.taxonomySignal).toBeNull();
  });
});
