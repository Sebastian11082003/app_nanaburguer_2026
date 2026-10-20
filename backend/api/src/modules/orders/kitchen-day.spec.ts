import { startOfKitchenDay } from './kitchen-day';

describe('startOfKitchenDay', () => {
  it('is midnight America/Bogota for an afternoon instant', () => {
    const now = new Date('2026-10-06T18:30:00.000Z');
    expect(startOfKitchenDay(now).toISOString()).toBe('2026-10-06T05:00:00.000Z');
  });

  it('uses the previous Bogota calendar day before 05:00 UTC', () => {
    const now = new Date('2026-10-06T04:59:00.000Z');
    expect(startOfKitchenDay(now).toISOString()).toBe('2026-10-05T05:00:00.000Z');
  });
});
