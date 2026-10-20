export const BILLING_PROVIDER = 'BILLING_PROVIDER';

export type BillingIssueInput = {
  invoiceId: string;
  number: string;
  restaurantNit: string;
  restaurantName: string;
  totalCents: number;
  currency: string;
};

export type BillingProviderResult = {
  cufe: string | null;
  payload: Record<string, unknown>;
};

/**
 * Port for HU-026. The local simulator is the only adapter in this
 * increment — Factus/DIAN stays a future adapter behind the same port.
 */
export interface BillingProvider {
  issue(input: BillingIssueInput): Promise<BillingProviderResult>;
  reject(
    input: BillingIssueInput,
    reason: string,
  ): Promise<BillingProviderResult>;
}
