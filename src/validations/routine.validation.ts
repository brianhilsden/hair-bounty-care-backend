import { z } from 'zod';

export const createRoutineTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string(), // emoji or icon name
  description: z.string().min(1).max(500),
  category: z.string().min(1).max(50), // oiling, hydrating, washing, etc.
  isDefault: z.boolean().optional().default(false),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  isActive: z.boolean().default(true),
  targetHairTypes: z.array(z.string()).default([]),
  targetPorosities: z.array(z.string()).default([]),
  targetGoals: z.array(z.string()).default([]),
  estimatedMinutes: z.number().int().min(1).max(240).default(5),
});

export const updateRoutineTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().optional(),
  description: z.string().min(1).max(500).optional(),
  category: z.string().min(1).max(50).optional(),
  isDefault: z.boolean().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  isActive: z.boolean().optional(),
  targetHairTypes: z.array(z.string()).optional(),
  targetPorosities: z.array(z.string()).optional(),
  targetGoals: z.array(z.string()).optional(),
  estimatedMinutes: z.number().int().min(1).max(240).optional(),
});

export const logRoutineSchema = z.object({
  templateId: z.string(),
  notes: z.string().max(500).optional(),
});

export const addUserRoutineSchema = z.object({
  templateId: z.string(),
});

export const removeUserRoutineSchema = z.object({
  templateId: z.string(),
});

export type CreateRoutineTemplateInput = z.infer<typeof createRoutineTemplateSchema>;
export type UpdateRoutineTemplateInput = z.infer<typeof updateRoutineTemplateSchema>;
export type LogRoutineInput = z.infer<typeof logRoutineSchema>;
export type AddUserRoutineInput = z.infer<typeof addUserRoutineSchema>;
export type RemoveUserRoutineInput = z.infer<typeof removeUserRoutineSchema>;
