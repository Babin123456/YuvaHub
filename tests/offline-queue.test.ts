import { describe, it, expect, beforeEach } from 'vitest';
import { offlineQueue } from '../src/lib/offlineQueue';

describe('Offline Mutation Queue Manager', () => {
  beforeEach(async () => {
    await offlineQueue.clear();
  });

  it('enqueues pending bookmark actions into the offline buffer', async () => {
    const action = await offlineQueue.enqueue(
      'BOOKMARK',
      '/api/v1/opportunities/opp-123/bookmark',
      'POST',
      { opportunityId: 'opp-123' }
    );

    expect(action.id).toBeDefined();
    expect(action.type).toBe('BOOKMARK');
    expect(action.endpoint).toBe('/api/v1/opportunities/opp-123/bookmark');

    const pending = await offlineQueue.getPendingActions();
    expect(pending.length).toBe(1);
    expect(pending[0].id).toBe(action.id);
  });

  it('removes successfully synchronized actions by ID', async () => {
    const action1 = await offlineQueue.enqueue('BOOKMARK', '/api/opp-1', 'POST', {});
    const action2 = await offlineQueue.enqueue('NOTE_SAVE', '/api/notes', 'PUT', { note: 'test' });

    let pending = await offlineQueue.getPendingActions();
    expect(pending.length).toBe(2);

    await offlineQueue.removeAction(action1.id);
    pending = await offlineQueue.getPendingActions();
    expect(pending.length).toBe(1);
    expect(pending[0].id).toBe(action2.id);
  });

  it('clears all actions upon manual reset', async () => {
    await offlineQueue.enqueue('BOOKMARK', '/api/opp-1', 'POST', {});
    await offlineQueue.enqueue('BOOKMARK', '/api/opp-2', 'POST', {});

    await offlineQueue.clear();
    const pending = await offlineQueue.getPendingActions();
    expect(pending.length).toBe(0);
  });
});
