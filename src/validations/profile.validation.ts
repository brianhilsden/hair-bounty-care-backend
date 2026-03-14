import { z } from 'zod';

// Enums matching Prisma schema
export const curlPatternEnum = z.enum([
  'TYPE_1A', 'TYPE_1B', 'TYPE_1C',
  'TYPE_2A', 'TYPE_2B', 'TYPE_2C',
  'TYPE_3A', 'TYPE_3B', 'TYPE_3C',
  'TYPE_4A', 'TYPE_4B', 'TYPE_4C',
]);

export const hairDensityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const porosityEnum = z.enum(['LOW', 'NORMAL', 'HIGH']);
export const strandThicknessEnum = z.enum(['FINE', 'MEDIUM', 'THICK']);

export const hairGoalEnum = z.enum([
  'LENGTH',
  'DENSITY',
  'HEALTH',
  'MOISTURE',
  'DAMAGE_REPAIR',
  'FRESH_START',
  'STYLE_VARIETY',
]);

export const ageGroupEnum = z.enum(['KIDS', 'TEENS', 'YOUNG_ADULT', 'ADULT']);
export const genderEnum = z.enum(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']);

export const createHairProfileSchema = z.object({
  // User fields (will be extracted and applied to User model)
  ageGroup: ageGroupEnum.optional(),
  gender: genderEnum.optional(),

  // HairProfile fields
  curlPattern: curlPatternEnum.optional(),
  density: hairDensityEnum.optional(),
  porosity: porosityEnum.optional(),
  strandThickness: strandThicknessEnum.optional(),
  scalpType: z.string().optional(),
  hairPhotoUrl: z.string().url().optional(),
  faceShape: z.string().optional(),
  goals: z.array(hairGoalEnum).optional(),
  currentLength: z.number().positive().optional(),
  targetLength: z.number().positive().optional(),
});

export const updateHairProfileSchema = z.object({
  curlPattern: curlPatternEnum.optional(),
  density: hairDensityEnum.optional(),
  porosity: porosityEnum.optional(),
  strandThickness: strandThicknessEnum.optional(),
  scalpType: z.string().optional(),
  hairPhotoUrl: z.string().url().optional(),
  faceShape: z.string().optional(),
  goals: z.array(hairGoalEnum).optional(),
  currentLength: z.number().positive().optional(),
  targetLength: z.number().positive().optional(),
});

export type CreateHairProfileInput = z.infer<typeof createHairProfileSchema>;
export type UpdateHairProfileInput = z.infer<typeof updateHairProfileSchema>;
