import type { NextFunction, Request, Response } from 'express';
import { createIncidentSchema } from '../schemas/incident.schema.js';
import { createIncident } from '../services/incident.service.js';

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
