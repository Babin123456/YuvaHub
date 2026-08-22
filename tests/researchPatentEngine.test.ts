import { describe, it, expect } from 'vitest';
import { ResearchPatentEngine } from '../src/services/researchPatentEngine';

describe('Campus Research IP & Patent Licensing Engine (#ECSoC_2026)', () => {
  it('should list registered patents and IP assets', async () => {
    const patents = await ResearchPatentEngine.getPatents({});
    expect(patents.length).toBeGreaterThan(0);
    expect(patents[0]).toHaveProperty('patentId');
    expect(patents[0]).toHaveProperty('technologyDomain');
  });

  it('should filter patents by technology domain', async () => {
    const results = await ResearchPatentEngine.getPatents({
      technologyDomain: 'QUANTUM',
    });
    expect(results.every(p => p.technologyDomain === 'QUANTUM')).toBe(true);
  });

  it('should register a new university research patent', async () => {
    const created = await ResearchPatentEngine.registerPatent({
      patentTitle: 'Autonomous Subsea Drone Communication Mesh',
      campusName: 'IIT Kharagpur',
      leadInventorName: 'Dr. Debashis Ghosh',
      patentApplicationNumber: 'IN-2026-88192',
      technologyDomain: 'ARTIFICIAL_INTELLIGENCE',
      licensingFeeUsd: 75000,
      royaltySharePercent: 6.0,
      abstractDescription: 'Acoustic-optical hybrid wireless mesh routing for deep subsea autonomous vehicles.',
    });

    expect(created.patentId).toBeDefined();
    expect(created.patentStatus).toBe('FILED');
  });

  it('should execute a commercial licensing agreement', async () => {
    const patents = await ResearchPatentEngine.getPatents({});
    const target = patents[0];

    const licensed = await ResearchPatentEngine.licensePatent(
      target.patentId,
      'Global Silicon Foundry Consortium'
    );

    expect(licensed).not.toBeNull();
    expect(licensed!.patentStatus).toBe('LICENSED');
    expect(licensed!.commercialPartnerAssigned).toBe('Global Silicon Foundry Consortium');
  });
});
