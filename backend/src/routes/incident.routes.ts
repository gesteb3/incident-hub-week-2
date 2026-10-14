import { Router } from 'express';
import { createIncidentController } from '../controllers/incident.controller.js';

export const incidentRouter = Router();

incidentRouter.post('/', createIncidentController);
