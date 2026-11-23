import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { LayoutDto } from '../../floor-plan/dto/layout.dto';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Two-bay urgent care' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'Reception, triage and two treatment bays' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'Clinic' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 'Dr. Patel' })
  @IsOptional()
  @IsString()
  ownerName?: string;

  @ApiProperty({ type: LayoutDto, description: 'Layout of one floor, as captured by the editor' })
  @IsObject()
  layout: LayoutDto;
}

export class UpdateTemplateDto extends PartialType(CreateTemplateDto) {}

export class TemplateResponseDto {
  @ApiProperty() _id: string;
  @ApiProperty() name: string;
  @ApiProperty() description: string;
  @ApiProperty() category: string;
  @ApiProperty({ type: [String] }) tags: string[];
  @ApiProperty() ownerName: string;
  @ApiProperty({ type: LayoutDto }) layout: LayoutDto;
  @ApiProperty({ type: String, format: 'date-time' }) createdAt: string;
  @ApiProperty({ type: String, format: 'date-time' }) updatedAt: string;
}
