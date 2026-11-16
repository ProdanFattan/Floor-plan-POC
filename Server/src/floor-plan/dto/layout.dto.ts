import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FloorDto {
  @ApiProperty({ example: 'floor-ground' })
  id: string;

  @ApiProperty({ example: 'Ground Floor' })
  name: string;
}

export class BoundaryDto {
  @ApiProperty({ example: 40 })
  x: number;

  @ApiProperty({ example: 60 })
  y: number;

  @ApiProperty({ example: 800 })
  width: number;

  @ApiProperty({ example: 500 })
  height: number;
}

export class WallDto {
  @ApiProperty({ example: 'wall-1a2b' })
  id: string;

  @ApiProperty() x1: number;
  @ApiProperty() y1: number;
  @ApiProperty() x2: number;
  @ApiProperty() y2: number;

  @ApiPropertyOptional({ example: 'floor-ground' })
  floorId?: string;

  @ApiPropertyOptional({ example: 6 })
  thickness?: number;

  @ApiPropertyOptional({ description: 'Soft-deleted walls stay in the layout so they can be restored' })
  deleted?: boolean;

  @ApiPropertyOptional({ description: 'Id of the room this wall borders, when generated from a room' })
  roomId?: string;
}

export class DoorDto {
  @ApiProperty() id: string;

  @ApiProperty({ description: 'Wall the door is cut into' })
  wallId: string;

  @ApiProperty({ description: 'Position along the wall, 0..1' })
  t: number;

  @ApiProperty() width: number;

  @ApiPropertyOptional({ enum: ['left', 'right'] })
  swing?: 'left' | 'right';

  @ApiPropertyOptional() opensOutward?: boolean;
  @ApiPropertyOptional() floorId?: string;
}

export class FurnitureDto {
  @ApiProperty() id: string;

  @ApiProperty({ example: 'bed', description: 'bed, chair, desk, door, sink, ...' })
  type: string;

  @ApiProperty() x: number;
  @ApiProperty() y: number;
  @ApiPropertyOptional() width?: number;
  @ApiPropertyOptional() height?: number;
  @ApiPropertyOptional() rotation?: number;

  @ApiPropertyOptional({ example: 'B1' })
  bedNumber?: string;

  @ApiPropertyOptional({ example: 'available' })
  bedStatus?: string;
}

export class RoomDto {
  @ApiProperty({ example: 'room-x8f2' })
  id: string;

  @ApiProperty({ example: 'Waiting Room' })
  name: string;

  @ApiProperty({ example: 'waiting', description: 'Built-in type key or a custom room type key' })
  type: string;

  @ApiProperty() x: number;
  @ApiProperty() y: number;
  @ApiProperty() width: number;
  @ApiProperty() height: number;

  @ApiPropertyOptional({ enum: ['rectangle', 'polygon', 'l-shape'], example: 'rectangle' })
  shape?: string;

  @ApiPropertyOptional({ type: [Number], description: 'Flat [x0, y0, x1, y1, ...] list for polygon rooms' })
  polygonPoints?: number[];

  @ApiPropertyOptional({ example: 'floor-ground' })
  floorId?: string;

  @ApiPropertyOptional({ example: '#DBEAFE' })
  color?: string;

  @ApiPropertyOptional({ example: 4 })
  capacity?: number;

  @ApiPropertyOptional({ type: [String] })
  assignedDoctors?: string[];

  @ApiPropertyOptional({ description: 'Status name applied to a patient dropped into this room', example: 'Checked In' })
  patientAssignStatus?: string;

  @ApiPropertyOptional() withWalls?: boolean;
  @ApiPropertyOptional() showBorder?: boolean;
  @ApiPropertyOptional() isTransitSpace?: boolean;

  @ApiPropertyOptional({ type: [FurnitureDto] })
  furniture?: FurnitureDto[];
}

export class LabelDto {
  @ApiProperty() id: string;
  @ApiProperty() text: string;
  @ApiProperty() x: number;
  @ApiProperty() y: number;
  @ApiPropertyOptional() fontSize?: number;
  @ApiPropertyOptional() floorId?: string;
}

export class CustomRoomTypeDto {
  @ApiProperty({ example: 'physio' })
  key: string;

  @ApiProperty({ example: 'Physio' })
  label: string;

  @ApiPropertyOptional({ example: '#FDE68A' })
  color?: string;
}

export class LayoutDto {
  @ApiProperty({ type: [FloorDto] })
  floors: FloorDto[];

  @ApiPropertyOptional({ type: BoundaryDto, nullable: true })
  boundary?: BoundaryDto | null;

  @ApiProperty({ type: [WallDto] })
  walls: WallDto[];

  @ApiProperty({ type: [DoorDto] })
  doors: DoorDto[];

  @ApiProperty({ type: [RoomDto] })
  rooms: RoomDto[];

  @ApiProperty({ type: [LabelDto] })
  labels: LabelDto[];

  @ApiPropertyOptional({ type: [CustomRoomTypeDto] })
  customRoomTypes?: CustomRoomTypeDto[];
}
