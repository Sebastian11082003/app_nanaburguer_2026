import { UserRole } from '@prisma/client';

import {
  SYSTEM_ROLE_PERMISSIONS,
  unseenDefaultPermissionGrants,
} from './permissions.catalog';

describe('unseenDefaultPermissionGrants', () => {
  it('grants a brand-new catalog code to the default stations only', () => {
    const already = new Set(
      Object.values(SYSTEM_ROLE_PERMISSIONS).flat().filter(
        (code) => code !== 'ORDERS_CANCEL_ITEM',
      ),
    );

    const grants = unseenDefaultPermissionGrants(already);
    const byRole = grants.filter((row) => row.code === 'ORDERS_CANCEL_ITEM');

    expect(byRole.map((row) => row.systemKey).sort()).toEqual([
      UserRole.ADMIN,
      UserRole.CASHIER,
    ]);
    expect(byRole.some((row) => row.systemKey === UserRole.WAITER)).toBe(
      false,
    );
  });

  it('does not re-grant a code already assigned to any role in the tenant', () => {
    const already = new Set(['ORDERS_CANCEL_ITEM']);

    expect(
      unseenDefaultPermissionGrants(already).some(
        (row) => row.code === 'ORDERS_CANCEL_ITEM',
      ),
    ).toBe(false);
  });
});
