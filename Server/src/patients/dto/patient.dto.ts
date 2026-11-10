import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { GENDERS, Gender } from '../schemas/patient.schema';

export class PatientQueryDto {
  @ApiPropertyOptional({ description: 'Matches first name, last name or PHN', example: 'smi' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class CreatePatientDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  lastName: string;

  @ApiPropertyOptional({ example: '9123456789', description: 'Personal health number' })
  @IsOptional()
  @IsString()
  phn?: string;

  @ApiPropertyOptional({ example: '1984-03-12' })
  @IsOptional()
  @IsISO8601({ strict: true })
  dob?: string;

  @ApiPropertyOptional({ enum: GENDERS })
  @IsOptional()
  @IsIn(GENDERS)
  gender?: Gender;

  @ApiPropertyOptional({ example: '+1 604 555 0182' })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class UpdatePatientDto extends PartialType(CreatePatientDto) {}

export class PatientResponseDto {
  @ApiProperty() _id: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty({ example: 'Jane Smith' }) fullName: string;
  @ApiProperty() phn: string;
  @ApiProperty({ type: String, nullable: true }) dob: string | null;
  @ApiProperty({ enum: GENDERS }) gender: Gender;
  @ApiProperty() phone: string;
}
