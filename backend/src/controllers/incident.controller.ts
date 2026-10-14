import type { NextFunction, Request, Response } from 'express';
import {
  createIncidentSchema,
  incidentIdSchema,
  listIncidentsSchema,
} from '../schemas/incident.schema.js';
import {
  createIncident,
  getIncidentById,
  getIncidentHistory,
  listIncidents,
} from '../services/incident.service.js';

export async function createIncidentController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { body } = createIncidentSchema.parse({ body: request.body });
    const incident = await createIncident(body);

    response.status(201).json({ data: incident });
  } catch (error) {
    next(error);
  }
}

export async function getIncidentHistoryController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { params } = incidentIdSchema.parse({ params: request.params });
    const history = await getIncidentHistory(params.id);
    response.status(200).json({ data: history });
  } catch (error) {
    next(error);
  }
}

export async function listIncidentsController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { query } = listIncidentsSchema.parse({ query: request.query });
    const result = await listIncidents(query);
    response.status(200).json({ data: result.items, meta: result.pagination });
  } catch (error) {
    next(error);
  }
}

export async function getIncidentByIdController(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { params } = incidentIdSchema.parse({ params: request.params });
    const incident = await getIncidentById(params.id);
    response.status(200).json({ data: incident });
  } catch (error) {
    next(error);
  }
}
