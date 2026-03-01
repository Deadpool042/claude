"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formDataToUpdateProjectDto } from "@/lib/projects/domain/update-project.dto";
import { ProjectService } from "@/lib/projects/services/project-service";
import { TraefikService } from "../services/traefik-service";

interface ActionState {
  error: string | null;
}

export async function updateProjectAction(
  projectId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { raw } = formDataToUpdateProjectDto(formData);

  const service = new ProjectService(prisma, new TraefikService());
  const res = await service.updateProject(projectId, raw);

  if (!res.ok) return { error: res.error };

  redirect(`/dashboard/projects/${projectId}`);
}