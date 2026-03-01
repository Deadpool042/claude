import type { WpProjectRef } from "../infra/wp-project-repo";
import type { WpServiceDeps } from "../wp-service";

export type CommandContext = {
  project: WpProjectRef;
};

export interface Command<TInput, TOutput> {
  name: string;
  execute(input: TInput, ctx: CommandContext, deps: WpServiceDeps): Promise<TOutput>;
}