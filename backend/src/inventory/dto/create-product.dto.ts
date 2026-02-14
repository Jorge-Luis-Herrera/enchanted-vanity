import { IsString, IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  nombre: string;

  @Type(() => Number)
  @IsNumber()
  cantidad: number;

  @Type(() => Number)
  @IsNumber()
  precio: number;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  esCombo?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  esOferta?: boolean;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  @Type(() => Number)
  categoryIds?: number[];
}
