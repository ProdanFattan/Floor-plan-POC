import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import { LayoutDto } from './layout.dto';

export class SaveFloorPlanDto {
  @ApiProperty({
    type: LayoutDto,
    description:
      'The whole layout. Nested objects are stored as sent; the schema below documents the fields the client uses.',
  })
  @IsObject()
  layout: LayoutDto;

  @ApiPropertyOptional({ example: 'Front desk' })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class FloorPlanResponseDto {
  @ApiProperty({ type: LayoutDto, nullable: true, description: 'null until the first save' })
  layout: LayoutDto | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  updatedAt: string | null;

  @ApiProperty({ type: String, nullable: true })
  updatedBy: string | null;
}
