import { z } from 'zod';
import { isValidStatus, type ApplicationStatusId } from '@/lib/statuses';

// Status from the APPLICATION_STATUSES catalog
const statusSchema = z
  .string()
  .refine(isValidStatus, 'Неизвестный статус')
  .transform((v) => v as ApplicationStatusId);

// Empty string → null; otherwise http(s) URLs only
const optionalUrl = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v && v.length > 0 ? v : null))
  .refine((v) => v === null || /^https?:\/\//i.test(v), {
    message: 'URL должен начинаться с http(s)://',
  });

// Full create-application schema (POST /api/applications)
export const applicationInputSchema = z.object({
  vacancyName: z.string().trim().max(300).optional().nullable(),
  vacancyUrl: optionalUrl,
  vacancyId: z.string().trim().optional().nullable(),
  employerName: z.string().trim().max(300).optional().nullable(),
  employerId: z.string().trim().optional().nullable(),
  employerLogoUrl: z.string().trim().optional().nullable(),
  areaName: z.string().trim().optional().nullable(),
  isRemote: z.boolean().optional(),
  salaryFrom: z.number().int().nonnegative().optional().nullable(),
  salaryTo: z.number().int().nonnegative().optional().nullable(),
  salaryCurrency: z.string().trim().optional().nullable(),
  salaryGross: z.boolean().optional().nullable(),
  status: statusSchema,
  appliedAt: z.string().min(1),
  notes: z.string().trim().max(5000).optional().nullable(),
  // Unique together with userId — guards against import/from-url duplicates
  externalId: z.string().trim().optional().nullable(),
});

// All fields optional for PATCH
export const applicationPatchSchema = applicationInputSchema.partial();

export type ApplicationInput = z.infer<typeof applicationInputSchema>;

export function parseAppliedAt(value: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid application date');
  }
  return d;
}

export function asStatus(value: string): ApplicationStatusId {
  if (!isValidStatus(value)) {
    throw new Error('Unknown status');
  }
  return value;
}

// Empty strings → null; isRemote defaults to false
export function toApplicationData(input: ApplicationInput, userId: number) {
  return {
    userId,
    vacancyName: input.vacancyName || null,
    vacancyUrl: input.vacancyUrl || null,
    vacancyId: input.vacancyId || null,
    employerName: input.employerName || null,
    employerId: input.employerId || null,
    employerLogoUrl: input.employerLogoUrl || null,
    areaName: input.areaName || null,
    isRemote: input.isRemote ?? false,
    salaryFrom: input.salaryFrom ?? null,
    salaryTo: input.salaryTo ?? null,
    salaryCurrency: input.salaryCurrency || null,
    salaryGross: input.salaryGross ?? null,
    status: input.status,
    appliedAt: parseAppliedAt(input.appliedAt),
    notes: input.notes || null,
    externalId: input.externalId || null,
  };
}
