import { Injectable } from '@nestjs/common';
import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
@Injectable()
export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Min(1)
  limit?: number;
  @IsOptional()
  @IsNumber()
  @IsPositive()
  offset?: number;
}
