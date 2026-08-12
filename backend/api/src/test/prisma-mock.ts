/**
 * Reusable Prisma mock for unit tests.
 * Keeps tests isolated from the real database while preserving the same
 * delegate shape (`prisma.<model>.<method>`) used across services.
 */
export type PrismaMock = Record<string, unknown>;

function createDelegateMock() {
  return {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };
}

export function createPrismaMock(): PrismaMock {
  const mock: PrismaMock = {
    tableEntity: createDelegateMock(),
    order: createDelegateMock(),
    orderItem: createDelegateMock(),
    menuItem: createDelegateMock(),
    category: createDelegateMock(),
    delivery: createDelegateMock(),
    sale: createDelegateMock(),
    payment: createDelegateMock(),
    invoice: createDelegateMock(),
    user: createDelegateMock(),
    restaurant: createDelegateMock(),
    platformAdmin: createDelegateMock(),
    cashMovement: createDelegateMock(),
  };

  // `$transaction(cb)` just runs the callback with the same mock,
  // matching how services use `tx.<model>` inside the transaction.
  mock.$transaction = jest.fn((cb: (tx: PrismaMock) => unknown) => cb(mock));

  return mock;
}
