import { z } from "zod";

export const sourceSchema = z.object({
  title: z.string(),
  author: z.string(),
  note: z.string(),
});

export const patternKindSchema = z.enum([
  "equal_division",
  "interpolation",
  "cell",
  "symmetry",
  "hybrid",
]);

export const patternSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  kind: patternKindSchema,
  intervals: z.array(z.number()),
  wrap: z.boolean(),
  octaveSpan: z.number().default(12),
  defaultLength: z.number(),
  source: sourceSchema,
});

export type Pattern = z.infer<typeof patternSchema>;
export type PatternKind = z.infer<typeof patternKindSchema>;
export type Source = z.infer<typeof sourceSchema>;
