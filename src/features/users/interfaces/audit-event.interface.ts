export interface AuditEvent {
  event_id: string;
  event_type: string;
  role_type: string;        // 'user' o 'admin'
  entity_id: string;          // ID de la entidad (usuario o admin)
  changed_by: string;         // Email del usuario que realizó el cambio
  changed_at: Date;           // Fecha y hora del cambio
  changed_fields: string[];   // Campos modificados
  old_values: Record<string, any>; // Valores antiguos
  new_values: Record<string, any>; // Valores nuevos
  client_type: string;      // 'web' o 'mobile'

}