import { AuditAction, AuditSeverity, AuditLogDocument } from '../models/AuditLog';

export interface AuditEventInput {
  action: AuditAction;
  severity?: AuditSeverity;
  actorId?: string;
  actorEmail?: string;
  targetId?: string;
  targetModel?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export class AuditService {
  private static buffer: AuditEventInput[] = [];
  private static flushInterval: NodeJS.Timeout | null = null;
  private static readonly MAX_BUFFER_SIZE = 50;
  private static readonly FLUSH_INTERVAL_MS = 5000;

  /**
   * Sensitive key sanitization filter
   */
  public static sanitizeDetails(details: Record<string, any>): Record<string, any> {
    if (!details || typeof details !== 'object') return {};
    const sanitized: Record<string, any> = {};
    const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'cookie', 'apikey', 'api_key'];

    for (const [key, value] of Object.entries(details)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeDetails(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Log an audit event into the asynchronous buffer
   */
  public static log(event: AuditEventInput): void {
    const sanitizedEvent: AuditEventInput = {
      ...event,
      severity: event.severity || 'INFO',
      details: this.sanitizeDetails(event.details || {}),
    };

    this.buffer.push(sanitizedEvent);

    if (this.buffer.length >= this.MAX_BUFFER_SIZE) {
      void this.flush();
    } else if (!this.flushInterval) {
      this.flushInterval = setTimeout(() => {
        void this.flush();
      }, this.FLUSH_INTERVAL_MS);
    }
  }

  /**
   * Flush all buffered audit events into the database
   */
  public static async flush(dbInstance?: any): Promise<number> {
    if (this.flushInterval) {
      clearTimeout(this.flushInterval);
      this.flushInterval = null;
    }

    if (this.buffer.length === 0) return 0;

    const eventsToInsert = this.buffer.map((item) => ({
      ...item,
      timestamp: new Date(),
    }));
    this.buffer = [];

    try {
      if (dbInstance && typeof dbInstance.collection === 'function') {
        await dbInstance.collection('audit_logs').insertMany(eventsToInsert, { ordered: false });
      }
      return eventsToInsert.length;
    } catch (error) {
      console.error('[AuditService] Failed to flush audit logs:', error);
      return 0;
    }
  }

  /**
   * Status and buffer inspection
   */
  public static getPendingCount(): number {
    return this.buffer.length;
  }

  public static clearBuffer(): void {
    this.buffer = [];
    if (this.flushInterval) {
      clearTimeout(this.flushInterval);
      this.flushInterval = null;
    }
  }
}
