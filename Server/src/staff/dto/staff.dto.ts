import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { STAFF_ROLES, StaffRole } from '../schemas/staff.schema';

export class StaffQueryDto {
  @ApiPropertyOptional({ enum: STAFF_ROLES })
  @IsOptional()
  @IsIn(STAFF_ROLES)
  role?: StaffRole;
}

export class CreateStaffDto {
  @ApiProperty({ enum: STAFF_ROLES })
  @IsIn(STAFF_ROLES)
  role: StaffRole;

  @ApiPropertyOptional({ example: 'Dr.' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Amara' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Okafor' })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}

export class StaffResponseDto {
  @ApiProperty() _id: string;
  @ApiProperty({ enum: STAFF_ROLES }) role: StaffRole;
  @ApiProperty() title: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty({ example: 'Dr. Amara Okafor' }) displayName: string;
}
