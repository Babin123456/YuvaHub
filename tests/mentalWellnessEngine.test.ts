import { describe, it, expect } from 'vitest';
import { StudentMentalWellnessEngine } from '../src/services/mentalWellnessEngine';

describe('Student Mental Wellness Desk Engine (#ECSoC_2026)', () => {
  it('should list existing mental wellness check-in records', async () => {
    const checkIns = await StudentMentalWellnessEngine.getCheckIns({});
    expect(checkIns.length).toBeGreaterThan(0);
    expect(checkIns[0]).toHaveProperty('studentId');
    expect(checkIns[0]).toHaveProperty('burnoutScorePercent');
  });

  it('should calculate burnout score accurately based on mood and stress levels', async () => {
    const criticalCheckIn = await StudentMentalWellnessEngine.createCheckIn({
      studentId: 'STU-9901',
      studentName: 'Rohan Joshi',
      campusName: 'BITS Pilani',
      moodRating: 1,
      stressLevel: 'CRITICAL',
      primaryStressor: 'EXAMS',
      supportRequested: true,
    });

    expect(criticalCheckIn.burnoutScorePercent).toBeGreaterThanOrEqual(80);
    expect(criticalCheckIn.sessionStatus).toBe('PENDING');
  });

  it('should filter check-ins by stress level', async () => {
    const highStressRecords = await StudentMentalWellnessEngine.getCheckIns({
      stressLevel: 'HIGH',
    });
    expect(highStressRecords.every(r => r.stressLevel === 'HIGH')).toBe(true);
  });

  it('should update counseling session status and attach notes', async () => {
    const checkIns = await StudentMentalWellnessEngine.getCheckIns({});
    const target = checkIns[0];

    const updated = await StudentMentalWellnessEngine.updateSessionStatus(
      target.studentId,
      'SCHEDULED',
      'Counseling appointment set with Dr. Sharma for Friday 3 PM.'
    );

    expect(updated).not.toBeNull();
    expect(updated!.sessionStatus).toBe('SCHEDULED');
    expect(updated!.confidentialNotes).toContain('Friday 3 PM');
  });
});
