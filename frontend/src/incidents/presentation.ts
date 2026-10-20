import type { Incident, User } from '../api';

export const statusLabels: Record<Incident['status'], string> = {
  NUEVO: 'Nuevo', ASIGNADO: 'Asignado', EN_PROCESO: 'En proceso', RESUELTO: 'Resuelto', CERRADO: 'Cerrado',
};
export const priorityLabels: Record<Incident['priority'], string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica',
};
export const roleLabels: Record<User['role'], string> = {
  REQUESTER: 'Solicitante', TECHNICIAN: 'Técnico', ADMIN: 'Administrador',
};
export const statusOrder = Object.keys(statusLabels) as Incident['status'][];
export const nextStatus: Partial<Record<Incident['status'], Incident['status']>> = {
  ASIGNADO: 'EN_PROCESO', EN_PROCESO: 'RESUELTO', RESUELTO: 'CERRADO',
};
export const statusActions: Partial<Record<Incident['status'], string>> = {
  EN_PROCESO: 'Iniciar atención', RESUELTO: 'Resolver incidente', CERRADO: 'Cerrar incidente',
};
export const formatDate = (value: string) => new Intl.DateTimeFormat('es-GT', {
  dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value));
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'No se pudo completar la acción.';
export const initials = (name: string) => name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
