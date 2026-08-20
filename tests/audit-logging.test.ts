import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AuditService } from '../src/services/auditService';

describe('Structured Audit Logging Service', () => {
  beforeEach(() => {
    AuditService.clearBuffer();
  });

  afterEach(() => {
    AuditService.clearBuffer();
  });

  describe('Sanitization Layer', () => {
    it('redacts sensitive authentication tokens and passwords', () => {
      const rawPayload = {
        username: 'student123',
        password: 'SuperSecretPassword!',
        apiKey: 'AIzaSyTestApiKey123',
        nested: {
          authorization: 'Bearer eyJhbGciOi...',
          theme: 'dark',
        },
      };

      const sanitized = AuditService.sanitizeDetails(rawPayload);

      expect(sanitized.username).toBe('student123');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
      expect(sanitized.nested.authorization).toBe('[REDACTED]');
      expect(sanitized.nested.theme).toBe('dark');
    });

    it('handles non-object inputs safely', () => {
      expect(AuditService.sanitizeDetails(null as any)).toEqual({});
      expect(AuditService.sanitizeDetails(undefined as any)).toEqual({});
    });
  });

  describe('Micro-batching & Event Queue', () => {
    it('buffers events in memory without blocking execution', () => {
      AuditService.log({
        action: 'OPPORTUNITY_CREATE',
        actorId: 'user-777',
        actorEmail: 'admin@yuvahub.dev',
        details: { title: 'New AI Hackathon' },
      });

      expect(AuditService.getPendingCount()).toBe(1);
    });

    it('auto flushes when buffer hits capacity', async () => {
      for (let i = 0; i < 55; i++) {
        AuditService.log({
          action: 'OPPORTUNITY_UPDATE',
          actorId: `user-${i}`,
          details: { iteration: i },
        });
      }

      // Buffer should flush and retain only remainder
      expect(AuditService.getPendingCount()).toBeLessThan(50);
    });
  });
});
