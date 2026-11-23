import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export const MAX_ROWS_PER_REQUEST = 500;

export class LiveBedRowDto {
  @ApiProperty({ example: 'furn-bed-1' })
  @IsString()
  bedId: string;

  @ApiProperty({ example: 'occupied', description: 'available, occupied, dirty, cleaning, blocked' })
  @IsString()
  bedStatus: string;
}

export class LivePatientRowDto {
  @ApiProperty({ description: 'Schedule id, which is also the patient card id on the board' })
  @IsString()
  scheduleId: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  patientId?: string | null;

  @ApiPropertyOptional({ example: '2026-11-05', nullable: true })
  @IsOptional()
  @IsString()
  scheduleDate?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  roomId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  bedId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  floorId?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  x?: number | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsNumber()
  y?: number | null;

  @ApiPropertyOptional({ example: 'in-room' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  @IsOptional()
  admittedAt?: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  @IsOptional()
  releaseAt?: string | null;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  @IsOptional()
  releasedAt?: string | null;
}

export class LiveRoomRowDto {
  @ApiProperty()
  @IsString()
  roomId: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  floorId?: string | null;

  @ApiPropertyOptional({ enum: ['clean', 'needs_cleaning', 'in_progress'] })
  @IsOptional()
  @IsString()
  cleaningStatus?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  @IsOptional()
  lastCleanedAt?: string | null;

  @ApiPropertyOptional({ type: [Object], description: 'Nurse ids or names' })
  @IsOptional()
  @IsArray()
  assignedNurses?: unknown[];

  @ApiPropertyOptional({ type: [LiveBedRowDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LiveBedRowDto)
  beds?: LiveBedRowDto[];
}

export class UpdateLiveStateDto {
  @ApiPropertyOptional({
    enum: ['merge', 'replace'],
    default: 'merge',
    description: 'merge applies the sent rows on top of the stored ones; replace overwrites the sent arrays',
  })
  @IsOptional()
  @IsIn(['merge', 'replace'])
  mode?: 'merge' | 'replace';

  @ApiPropertyOptional({ type: [LivePatientRowDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_ROWS_PER_REQUEST)
  @ValidateNested({ each: true })
  @Type(() => LivePatientRowDto)
  patients?: LivePatientRowDto[];

  @ApiPropertyOptional({ type: [LiveRoomRowDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_ROWS_PER_REQUEST)
  @ValidateNested({ each: true })
  @Type(() => LiveRoomRowDto)
  rooms?: LiveRoomRowDto[];

  @ApiPropertyOptional({ type: [String], description: 'Schedules taken off the board (merge mode only)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  removedScheduleIds?: string[];
}

export class LiveStateResponseDto {
  @ApiProperty({ type: [LivePatientRowDto] })
  patients: LivePatientRowDto[];

  @ApiProperty({ type: [LiveRoomRowDto] })
  rooms: LiveRoomRowDto[];

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  updatedAt: string | null;
}
