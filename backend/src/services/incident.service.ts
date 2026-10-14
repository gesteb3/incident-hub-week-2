import { prisma } from '../lib/prisma.js';
import { AppError } from '../errors/app-error.js';
import type { CreateIncidentInput } from '../schemas/incident.schema.js';

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
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true } },
      technician: { select: { id: true, name: true, email: true } },
    },
  });
}
