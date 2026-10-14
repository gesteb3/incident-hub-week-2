import { Router } from 'express';
import {
  createIncidentController,
  getIncidentByIdController,
  listIncidentsController,
} from '../controllers/incident.controller.js';

export const incidentRouter = Router();

incidentRouter.get('/', listIncidentsController);
incidentRouter.get('/:id', getIncidentByIdController);
incidentRouter.post('/', createIncidentController);
