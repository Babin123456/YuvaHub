export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AuditAction = 
  | 'OPPORTUNITY_CREATE'
  | 'OPPORTUNITY_UPDATE'
  | 'OPPORTUNITY_DELETE'
  | 'USER_ROLE_CHANGE'
  | 'SETTINGS_MUTATION'
  | 'AUTH_SECURITY_ALERT';

export interface AuditLogDocument {
  id?: string;
  action: AuditAction;
  severity: AuditSeverity;
  actorId?: string;
  actorEmail?: string;
  targetId?: string;
  targetModel?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: Date;
}
