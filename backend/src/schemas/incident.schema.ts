import { z } from 'zod';

export const createIncidentSchema = z.object({
  body: z.object({
    title: z.string().trim().min(5).max(160),
    description: z.string().trim().min(10).max(5000),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    reporterId: z.string().uuid(),
    categoryId: z.string().uuid(),
  }),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>['body'];
