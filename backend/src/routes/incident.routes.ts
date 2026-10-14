import { Router } from 'express';
import {
  createIncidentController,
  assignTechnicianController,
  getIncidentByIdController,
  getIncidentHistoryController,
  listIncidentsController,
} from '../controllers/incident.controller.js';

export const incidentRouter = Router();

incidentRouter.get('/', listIncidentsController);
incidentRouter.get('/:id/history', getIncidentHistoryController);
incidentRouter.get('/:id', getIncidentByIdController);
incidentRouter.post('/', createIncidentController);
incidentRouter.patch('/:id/assignment', assignTechnicianController);
