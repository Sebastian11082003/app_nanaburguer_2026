import { IsString, MinLength } from 'class-validator';

export class ProvisionStationsDto {
  @IsString()
  @MinLength(6)
  password!: string;
}
