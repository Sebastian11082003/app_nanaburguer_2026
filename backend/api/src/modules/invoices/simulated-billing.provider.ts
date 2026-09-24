import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import {
  BillingIssueInput,
  BillingProvider,
  BillingProviderResult,
} from './billing-provider';

export const SIMULATOR_PROVIDER_ID = 'restoos-simulator';

/**
 * Local fiscal document. Not a DIAN/Factus invoice — stores a payload
 * so the POS can keep the provider response (HU-026) without a live API.
 */
@Injectable()
export class SimulatedBillingProvider implements BillingProvider {
  async issue(input: BillingIssueInput): Promise<BillingProviderResult> {
    const cufe = `SIM-${randomUUID()}`;
    return {
      cufe,
      payload: {
        provider: SIMULATOR_PROVIDER_ID,
        environment: 'local',
        action: 'issue',
        issuedAt: new Date().toISOString(),
        cufe,
        invoiceNumber: input.number,
        nit: input.restaurantNit,
        totalCents: input.totalCents,
        currency: input.currency,
        legal: 'Simulated electronic invoice. Not a DIAN document.',
      },
    };
  }

  async reject(
    input: BillingIssueInput,
    reason: string,
  ): Promise<BillingProviderResult> {
    return {
      cufe: null,
      payload: {
        provider: SIMULATOR_PROVIDER_ID,
        environment: 'local',
        action: 'reject',
        rejectedAt: new Date().toISOString(),
        invoiceNumber: input.number,
        nit: input.restaurantNit,
        reason,
        legal: 'Simulated rejection. Not a DIAN document.',
      },
    };
  }
}
