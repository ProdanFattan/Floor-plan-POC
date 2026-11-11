import { ApiProperty } from '@nestjs/swagger';

export class StatusResponseDto {
  @ApiProperty({ example: 'checked-in' })
  _id: string;

  @ApiProperty({ example: 'Checked In' })
  name: string;

  @ApiProperty({ example: 'CI', description: 'Short tag shown on patient avatars' })
  shortName: string;

  @ApiProperty({ example: '#0EA5E9' })
  color: string;

  @ApiProperty({ example: '#FFFFFF', description: 'Text colour on top of color' })
  fnColor: string;

  @ApiProperty({ example: 3 })
  order: number;

  @ApiProperty({ description: 'Status a new schedule starts with' })
  isDefault: boolean;
}
