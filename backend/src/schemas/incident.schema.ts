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

export const listIncidentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});

export const incidentIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const assignTechnicianSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    technicianId: z.string().uuid(),
    actorId: z.string().uuid(),
  }),
});

export type ListIncidentsInput = z.infer<typeof listIncidentsSchema>['query'];
export type AssignTechnicianInput = z.infer<typeof assignTechnicianSchema>['body'];
