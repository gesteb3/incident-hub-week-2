import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  user: { findFirst: vi.fn() },
  category: { findFirst: vi.fn() },
  incident: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  incidentHistory: { findMany: vi.fn(), create: vi.fn() },
  $transaction: vi.fn((operations: Promise<unknown>[]) => Promise.all(operations)),
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

describe('GET /api/incidents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    );
  });

  it('lista incidentes con paginación', async () => {
    const incidents = [{ id: randomUUID(), title: 'Equipo sin acceso', status: 'NUEVO' }];
    prismaMock.incident.findMany.mockResolvedValue(incidents);
    prismaMock.incident.count.mockResolvedValue(1);

    const response = await request(app).get('/api/incidents?page=1&limit=10');

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(incidents);
    expect(response.body.meta).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
  });

  it('consulta el detalle de un incidente', async () => {
    const incident = { id: randomUUID(), title: 'Equipo sin acceso', status: 'NUEVO' };
    prismaMock.incident.findUnique.mockResolvedValue(incident);

    const response = await request(app).get(`/api/incidents/${incident.id}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(incident);
  });

  it('responde 404 cuando el incidente no existe', async () => {
    prismaMock.incident.findUnique.mockResolvedValue(null);

    const response = await request(app).get(`/api/incidents/${randomUUID()}`);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('INCIDENT_NOT_FOUND');
  });

  it('devuelve el historial cronológico del incidente', async () => {
    const incidentId = randomUUID();
    const history = [
      {
        id: randomUUID(),
        incidentId,
        eventType: 'CREATED',
        previousStatus: null,
        newStatus: 'NUEVO',
        actor: { id: randomUUID(), name: 'Usuario Solicitante', role: 'REQUESTER' },
      },
    ];
    prismaMock.incident.findUnique.mockResolvedValue({ id: incidentId });
    prismaMock.incidentHistory.findMany.mockResolvedValue(history);

    const response = await request(app).get(`/api/incidents/${incidentId}/history`);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(history);
    expect(prismaMock.incidentHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { incidentId },
        orderBy: { createdAt: 'asc' },
      }),
    );
  });
});

describe('PATCH /api/incidents/:id/assignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    );
  });

  it('asigna un técnico y cambia un incidente NUEVO a ASIGNADO', async () => {
    const incidentId = randomUUID();
    const technicianId = randomUUID();
    const actorId = randomUUID();
    prismaMock.incident.findUnique.mockResolvedValue({ id: incidentId, status: 'NUEVO' });
    prismaMock.user.findFirst
      .mockResolvedValueOnce({ id: technicianId, name: 'Técnico de Soporte' })
      .mockResolvedValueOnce({ id: actorId });
    prismaMock.incident.update.mockResolvedValue({
      id: incidentId,
      technicianId,
      status: 'ASIGNADO',
    });
    prismaMock.incidentHistory.create.mockResolvedValue({ id: randomUUID() });

    const response = await request(app)
      .patch(`/api/incidents/${incidentId}/assignment`)
      .send({ technicianId, actorId });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ technicianId, status: 'ASIGNADO' });
    expect(prismaMock.incidentHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ eventType: 'ASSIGNED', newStatus: 'ASIGNADO' }),
      }),
    );
  });

  it('rechaza la asignación cuando el técnico no es válido', async () => {
    prismaMock.incident.findUnique.mockResolvedValue({ id: randomUUID(), status: 'NUEVO' });
    prismaMock.user.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: randomUUID() });

    const response = await request(app)
      .patch(`/api/incidents/${randomUUID()}/assignment`)
      .send({ technicianId: randomUUID(), actorId: randomUUID() });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('TECHNICIAN_NOT_FOUND');
    expect(prismaMock.incident.update).not.toHaveBeenCalled();
  });
});
