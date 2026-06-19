import { z } from 'zod';

// Common validation schemas

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  name: z.string().min(1).max(200),
  role: z.enum(['patient', 'doctor', 'paramedic', 'admin', 'nurse', 'specialist']),
  hospital: z.string().max(200).optional(),
  badgeId: z.string().max(100).optional(),
});

export const allergySchema = z.object({
  name: z.string().min(1).max(200),
  severity: z.enum(['mild', 'moderate', 'severe', 'life-threatening']),
  reaction: z.string().max(500).optional(),
  lastReactionDate: z.string().max(20).optional(),
  treatmentRequired: z.string().max(500).optional(),
  crossReactivity: z.string().max(500).optional(),
  verifiedBy: z.string().max(200).optional(),
});

export const medicationSchema = z.object({
  name: z.string().min(1).max(200),
  dose: z.string().min(1).max(100),
  frequency: z.string().min(1).max(200),
  startDate: z.string().max(20).optional(),
  endDate: z.string().max(20).optional(),
  prescriber: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  isOpioid: z.boolean().optional(),
  isPsychMed: z.boolean().optional(),
  requiresMonitoring: z.boolean().optional(),
  adherenceScore: z.number().min(0).max(100).optional(),
});

export const conditionSchema = z.object({
  name: z.string().min(1).max(200),
  diagnosedDate: z.string().max(20).optional(),
  status: z.enum(['active', 'chronic', 'resolved', 'remission']).optional(),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']).optional(),
  icdCode: z.string().max(20).optional(),
  cluster: z.string().max(100).optional(),
});

export const emergencyContactSchema = z.object({
  name: z.string().min(1).max(200),
  relationship: z.string().min(1).max(100),
  phone: z.string().min(1).max(30),
  email: z.string().email().optional(),
  priority: z.number().int().min(1).max(10),
  canConsent: z.boolean().optional(),
  language: z.string().max(50).optional(),
});

export const patientSearchSchema = z.object({
  name: z.string().max(200).optional(),
  bloodType: z.string().max(10).optional(),
});

// Validate request body against schema, return error response or parsed data
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.errors[0];
  return { success: false, error: firstError?.message || 'Validation failed' };
}
