import { IsUUID } from 'class-validator';

export class TransferTableDto {
  @IsUUID()
  newTableId!: string;
}
