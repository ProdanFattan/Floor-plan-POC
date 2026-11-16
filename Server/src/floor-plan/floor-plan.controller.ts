import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FloorPlanService } from './floor-plan.service';
import { FloorPlanResponseDto, SaveFloorPlanDto } from './dto/floor-plan.dto';

@ApiTags('Floor plan')
@Controller('floor-plan')
export class FloorPlanController {
  constructor(private readonly service: FloorPlanService) {}

  @Get()
  @ApiOperation({ summary: 'Get the saved floor plan layout' })
  @ApiOkResponse({ type: FloorPlanResponseDto })
  get(): Promise<FloorPlanResponseDto> {
    return this.service.get();
  }

  @Put()
  @ApiOperation({ summary: 'Replace the floor plan layout' })
  @ApiOkResponse({ type: FloorPlanResponseDto })
  save(@Body() dto: SaveFloorPlanDto): Promise<FloorPlanResponseDto> {
    return this.service.save(dto);
  }
}
