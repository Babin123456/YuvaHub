import { describe, it, expect, beforeEach } from 'vitest';
import { AlumniEndowmentEngine } from '../src/services/alumniEndowmentEngine';

describe('Campus Alumni Endowment Portal Engine (#ECSoC_2026)', () => {
  it('should list pre-seeded alumni endowment funds', async () => {
    const funds = await AlumniEndowmentEngine.getEndowments({});
    expect(funds.length).toBeGreaterThan(0);
    expect(funds[0]).toHaveProperty('fundId');
    expect(funds[0]).toHaveProperty('targetAmountUsd');
  });

  it('should filter endowment funds by campus name and category', async () => {
    const funds = await AlumniEndowmentEngine.getEndowments({
      campusName: 'IIT Madras',
    });
    expect(funds.every(f => f.campusName === 'IIT Madras')).toBe(true);
  });

  it('should create a new endowment fund and apply matching corporate ratio', async () => {
    const created = await AlumniEndowmentEngine.createEndowment({
      fundName: 'Robotics & Autonomous Drones Grant',
      campusName: 'IIT Roorkee',
      donorName: 'Ananya Roy',
      donorAlumniBatchYear: 2018,
      fundCategory: 'RESEARCH_GRANT',
      targetAmountUsd: 40000,
      initialContributionUsd: 10000,
      matchingGrantEnabled: true,
      matchingRatio: 2.0,
      description: 'Funding next-gen autonomous drone lab equipment.',
    });

    expect(created.fundId).toBeDefined();
    expect(created.currentAmountRaisedUsd).toBe(20000); // 10000 * 2.0
    expect(created.grantStatus).toBe('ACTIVE');
  });

  it('should contribute to an existing endowment and update funding status', async () => {
    const funds = await AlumniEndowmentEngine.getEndowments({});
    const target = funds[0];
    const initialAmount = target.currentAmountRaisedUsd;

    const updated = await AlumniEndowmentEngine.contributeToEndowment(target.fundId, 5000, 'Test Donor');
    expect(updated).not.toBeNull();
    expect(updated!.currentAmountRaisedUsd).toBeGreaterThan(initialAmount);
  });
});
