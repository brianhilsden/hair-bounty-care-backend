import { z } from 'zod';

export const createProgressPhotoSchema = z.object({
  photoUrl: z.string().url(),
  notes: z.string().max(500).optional(),
  currentLength: z.number().positive().optional(),
  takenAt: z.string().datetime().optional(), // ISO datetime string
});

export const updateProgressPhotoSchema = z.object({
  notes: z.string().max(500).optional(),
  currentLength: z.number().positive().optional(),
});

export type CreateProgressPhotoInput = z.infer<typeof createProgressPhotoSchema>;
export type UpdateProgressPhotoInput = z.infer<typeof updateProgressPhotoSchema>;
