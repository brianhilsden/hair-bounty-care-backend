import { z } from 'zod';

export const createRoutineTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string(), // emoji or icon name
  description: z.string().min(1).max(500),
  category: z.string().min(1).max(50), // oiling, hydrating, washing, etc.
  isDefault: z.boolean().optional().default(false),
});

export const updateRoutineTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().optional(),
  description: z.string().min(1).max(500).optional(),
  category: z.string().min(1).max(50).optional(),
  isDefault: z.boolean().optional(),
});

export const logRoutineSchema = z.object({
  templateId: z.string(),
  notes: z.string().max(500).optional(),
});

export type CreateRoutineTemplateInput = z.infer<typeof createRoutineTemplateSchema>;
export type UpdateRoutineTemplateInput = z.infer<typeof updateRoutineTemplateSchema>;
export type LogRoutineInput = z.infer<typeof logRoutineSchema>;
