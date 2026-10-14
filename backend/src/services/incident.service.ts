import { prisma } from '../lib/prisma.js';
import { AppError } from '../errors/app-error.js';
import type {
  CreateIncidentInput,
  ListIncidentsInput,
} from '../schemas/incident.schema.js';

const incidentSummaryInclude = {
  reporter: { select: { id: true, name: true, email: true } },
  category: { select: { id: true, name: true } },
  technician: { select: { id: true, name: true, email: true } },
} as const;

export async function createIncident(input: CreateIncidentInput) {
  const [reporter, category] = await Promise.all([
    prisma.user.findFirst({
      where: { id: input.reporterId, active: true },
      select: { id: true },
    }),
    prisma.category.findFirst({
      where: { id: input.categoryId, active: true },
      select: { id: true },
    }),
  ]);

  if (!reporter) {
    throw new AppError(404, 'REPORTER_NOT_FOUND', 'El usuario reportante no existe o está inactivo');
  }

  if (!category) {
    throw new AppError(404, 'CATEGORY_NOT_FOUND', 'La categoría no existe o está inactiva');
  }

  return prisma.incident.create({
    data: input,
    include: incidentSummaryInclude,
  });
}

export async function listIncidents(input: ListIncidentsInput) {
  const skip = (input.page - 1) * input.limit;
  const [items, total] = await prisma.$transaction([
    prisma.incident.findMany({
      skip,
      take: input.limit,
      orderBy: { createdAt: 'desc' },
      include: incidentSummaryInclude,
    }),
    prisma.incident.count(),
  ]);

  return {
    items,
    pagination: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit),
    },
  };
}

export async function getIncidentById(id: string) {
  const incident = await prisma.incident.findUnique({
    where: { id },
    include: incidentSummaryInclude,
  });

  if (!incident) {
    throw new AppError(404, 'INCIDENT_NOT_FOUND', 'El incidente no existe');
  }

  return incident;
}
