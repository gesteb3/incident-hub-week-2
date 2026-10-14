import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  user: { findFirst: vi.fn() },
  category: { findFirst: vi.fn() },
  incident: { create: vi.fn() },
  $disconnect: vi.fn(),
}));

vi.mock('../src/lib/prisma.js', () => ({ prisma: prismaMock }));

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

const { app } = await import('../src/app.js');

describe('POST /api/incidents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('crea un incidente válido con estado NUEVO', async () => {
    const reporterId = randomUUID();
    const categoryId = randomUUID();
    const incidentId = randomUUID();
    prismaMock.user.findFirst.mockResolvedValue({ id: reporterId });
    prismaMock.category.findFirst.mockResolvedValue({ id: categoryId });
    prismaMock.incident.create.mockResolvedValue({
      id: incidentId,
      title: 'Equipo sin acceso',
      description: 'El usuario no puede iniciar sesión',
      priority: 'HIGH',
      status: 'NUEVO',
      reporterId,
      categoryId,
    });

    const response = await request(app).post('/api/incidents').send({
      title: 'Equipo sin acceso',
      description: 'El usuario no puede iniciar sesión',
      priority: 'HIGH',
      reporterId,
      categoryId,
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({ id: incidentId, status: 'NUEVO' });
    expect(prismaMock.incident.create).toHaveBeenCalledOnce();
  });

  it('rechaza datos inválidos sin consultar la base de datos', async () => {
    const response = await request(app).post('/api/incidents').send({
      title: 'x',
      description: 'corta',
      priority: 'URGENT',
      reporterId: 'invalid',
      categoryId: 'invalid',
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(prismaMock.incident.create).not.toHaveBeenCalled();
  });

  it('responde 404 cuando el reportante no existe', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.category.findFirst.mockResolvedValue({ id: randomUUID() });

    const response = await request(app).post('/api/incidents').send({
      title: 'Equipo sin acceso',
      description: 'El usuario no puede iniciar sesión',
      priority: 'HIGH',
      reporterId: randomUUID(),
      categoryId: randomUUID(),
    });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('REPORTER_NOT_FOUND');
  });
});
