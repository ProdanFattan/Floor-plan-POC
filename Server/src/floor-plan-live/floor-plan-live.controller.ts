import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FloorPlanLiveService } from './floor-plan-live.service';
import { LiveStateResponseDto, UpdateLiveStateDto } from './dto/floor-plan-live.dto';

@ApiTags('Floor plan live')
@Controller('floor-plan/live')
export class FloorPlanLiveController {
  constructor(private readonly service: FloorPlanLiveService) {}

  @Get()
  @ApiOperation({ summary: 'Get patient placements and room/bed state on the live board' })
  @ApiOkResponse({ type: LiveStateResponseDto })
  get(): Promise<LiveStateResponseDto> {
    return this.service.get();
  }

  @Put()
  @ApiOperation({
    summary: 'Update live board state',
    description:
      'In merge mode only the sent rows change. A patient row with no room, bed or position is dropped, which is how a patient leaves the board.',
  })
  @ApiOkResponse({ type: LiveStateResponseDto })
  update(@Body() dto: UpdateLiveStateDto): Promise<LiveStateResponseDto> {
    return this.service.update(dto);
  }
}
