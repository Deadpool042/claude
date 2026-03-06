"use client";

import { useCallback, useState } from "react";
import type { z } from "zod";

type SubmitResult = {
  ok: boolean;
  issues?: z.ZodIssue[];
};

export function useSpecSubmit<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  onSubmit: (value: z.infer<TSchema>) => Promise<void> | void,
) {
  const [issues, setIssues] = useState<z.ZodIssue[]>([]);

  const submit = useCallback(
    async (value: unknown): Promise<SubmitResult> => {
      const parsed = schema.safeParse(value);
      if (!parsed.success) {
        setIssues(parsed.error.issues);
        return { ok: false, issues: parsed.error.issues };
      }

      setIssues([]);
      await onSubmit(parsed.data);
      return { ok: true };
    },
    [schema, onSubmit],
  );

  return { submit, issues };
}
