import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../../services/auditService';
import { AuditAction, AuditSeverity } from '../../models/AuditLog';

export function auditMiddleware(action: AuditAction, severity: AuditSeverity = 'INFO', targetModel?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (body: any): Response {
      res.send = originalSend;

      // Extract metadata safely
      const actorId = (req as any).user?.uid || (req as any).user?.id || (req as any).userId;
      const actorEmail = (req as any).user?.email;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      const targetId = req.params?.id || req.body?.id || req.body?._id;

      // Only record audit when mutation succeeds or emits notable client error
      if (res.statusCode >= 200 && res.statusCode < 400) {
        AuditService.log({
          action,
          severity,
          actorId,
          actorEmail,
          targetId: targetId ? String(targetId) : undefined,
          targetModel,
          ipAddress: typeof ipAddress === 'string' ? ipAddress : undefined,
          userAgent,
          details: {
            method: req.method,
            path: req.originalUrl || req.url,
            statusCode: res.statusCode,
            params: req.params,
            body: req.body,
          },
        });
      }

      return res.send(body);
    };

    next();
  };
}
