"use client";

import type { UseFormProps } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

export function useSpecForm<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  options: Omit<UseFormProps<z.infer<TSchema>>, "resolver"> = {},
) {
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    ...options,
  });
}
