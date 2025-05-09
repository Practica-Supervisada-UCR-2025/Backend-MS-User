import { v4 as uuidv4 } from 'uuid';
import { AuditEvent } from '../interfaces/audit-event.interface';
import axios from 'axios';

/**
 * Registra un evento de auditoría
 * @param auditEvent Información del evento a auditar
 */
export const logAuditEvent = async (auditEvent: AuditEvent): Promise<void> => {
  try {
    // En producción, esto enviaría el evento al microservicio de auditoría
    // await axios.post('http://audit-service:3010/api/audit', auditEvent);
    
    // Por ahora, lo guardamos en los logs
    console.log('AUDIT EVENT:', JSON.stringify(auditEvent, null, 2));
    
    // También se podría guardar en una tabla local de eventos de auditoría
    // como respaldo o mientras el microservicio no esté disponible
  } catch (error) {
    // No queremos que un error de auditoría impida la operación principal
    console.error('Error logging audit event:', error);
  }
};

/**
 * Registra un evento de actualización de perfil
 */
export const logProfileUpdate = async (
  clientType: 'mobile'| 'web',
  roleType: 'user' | 'admin',
  entityId: string,
  changedBy: string,
  changedFields: string[],
  oldValues: Record<string, any>,
  newValues: Record<string, any>,
): Promise<void> => {
  const auditEvent: AuditEvent = {
    event_id: uuidv4(),
    event_type: 'profile_update',
    client_type: clientType,
    role_type: roleType,
    entity_id: entityId,
    changed_by: changedBy,
    changed_at: new Date(),
    changed_fields: changedFields,
    old_values: oldValues,
    new_values: newValues

  };

  await logAuditEvent(auditEvent);
};