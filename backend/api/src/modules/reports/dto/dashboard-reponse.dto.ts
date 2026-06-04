export class DashboardResponseDto {
  salesToday!: number;
  salesWeek!: number;
  salesMonth!: number;

  totalOrders!: number;
  activeTables!: number;
  deliveriesToday!: number;

  topProduct!: {
    name: string;
    quantity: number;
  } | null;

  paymentMethods!: {
    method: string;
    total: number;
  }[];
}
