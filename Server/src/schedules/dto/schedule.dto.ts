import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsISO8601,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { VISIT_TYPES } from '../schemas/schedule.schema';

export class ScheduleQueryDto {
  @ApiProperty({ example: '2026-11-05T00:00:00.000Z', description: 'Inclusive start of the range' })
  @IsISO8601()
  from: string;

  @ApiProperty({ example: '2026-11-05T23:59:59.999Z', description: 'Inclusive end of the range' })
  @IsISO8601()
  to: string;

  @ApiPropertyOptional({ description: 'Only schedules for this provider' })
  @IsOptional()
  @IsMongoId()
  medicalStaffId?: string;
}

export class CreateScheduleDto {
  @ApiProperty({ description: 'Patient id' })
  @IsMongoId()
  patientId: string;

  @ApiPropertyOptional({ description: 'Provider (staff) id', nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsMongoId()
  medicalStaffId?: string | null;

  @ApiProperty({ example: '2026-11-05T09:00:00.000Z' })
  @IsISO8601()
  start: string;

  @ApiProperty({ example: '2026-11-05T09:30:00.000Z' })
  @IsISO8601()
  end: string;

  @ApiPropertyOptional({ example: 'Consultation', enum: VISIT_TYPES })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  typeOfVisit?: string;

  @ApiPropertyOptional({ example: 'Persistent cough' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  visitReason?: string;

  @ApiPropertyOptional({ example: 'scheduled', description: 'Status id; defaults to the default status' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  statusId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateScheduleDto extends PartialType(CreateScheduleDto) {}

export class UpdateScheduleStatusDto {
  @ApiProperty({ example: 'checked-in' })
  @IsString()
  @IsNotEmpty()
  statusId: string;
}

export class ScheduleEventDto {
  @ApiProperty() _id: string;
  @ApiProperty() patientId: string;
  @ApiProperty({ example: 'Jane Smith', description: 'Patient full name' })
  title: string;
  @ApiProperty() phn: string;
  @ApiProperty({ type: String, format: 'date-time' }) start: string;
  @ApiProperty({ type: String, format: 'date-time' }) end: string;
  @ApiProperty({ type: String, format: 'date-time', description: 'Same as start; kept for the board' })
  date: string;
  @ApiProperty() typeOfVisit: string;
  @ApiProperty() visitReason: string;
  @ApiProperty({ example: 'scheduled', description: 'Current status id' })
  lastStatusId: string;
  @ApiProperty({ example: 'Scheduled' }) statusName: string;
  @ApiProperty({ type: String, nullable: true }) medicalStaffId: string | null;
  @ApiProperty({ example: 'Dr. Amara Okafor' }) providerName: string;
  @ApiProperty() notes: string;
}

export class VisitTypesResponseDto {
  @ApiProperty({ type: [String] })
  visitTypes: string[];
}
