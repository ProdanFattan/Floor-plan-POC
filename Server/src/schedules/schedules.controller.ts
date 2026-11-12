import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { SchedulesService } from './schedules.service';
import {
  CreateScheduleDto,
  ScheduleEventDto,
  ScheduleQueryDto,
  UpdateScheduleDto,
  UpdateScheduleStatusDto,
  VisitTypesResponseDto,
} from './dto/schedule.dto';
import { VISIT_TYPES } from './schemas/schedule.schema';

@ApiTags('Schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly service: SchedulesService) {}

  @Get()
  @ApiOperation({ summary: 'List schedules whose start falls in [from, to], as board events' })
  @ApiOkResponse({ type: [ScheduleEventDto] })
  list(@Query() query: ScheduleQueryDto): Promise<ScheduleEventDto[]> {
    return this.service.list(query);
  }

  @Get('visit-types')
  @ApiOperation({ summary: 'Suggested visit types for the schedule form' })
  @ApiOkResponse({ type: VisitTypesResponseDto })
  visitTypes(): VisitTypesResponseDto {
    return { visitTypes: VISIT_TYPES };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one schedule' })
  @ApiOkResponse({ type: ScheduleEventDto })
  @ApiNotFoundResponse()
  get(@Param('id', ParseObjectIdPipe) id: string): Promise<ScheduleEventDto> {
    return this.service.get(id);
  }

  @Post()
  @ApiOperation({ summary: 'Book a patient; they appear in the board sidebar for that day' })
  @ApiCreatedResponse({ type: ScheduleEventDto })
  @ApiBadRequestResponse({ description: 'Unknown patient or status, or end before start' })
  create(@Body() dto: CreateScheduleDto): Promise<ScheduleEventDto> {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a schedule' })
  @ApiOkResponse({ type: ScheduleEventDto })
  @ApiNotFoundResponse()
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateScheduleDto,
  ): Promise<ScheduleEventDto> {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change the status (the board calls this when a patient is dropped in a room)' })
  @ApiOkResponse({ type: ScheduleEventDto })
  @ApiNotFoundResponse()
  updateStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateScheduleStatusDto,
  ): Promise<ScheduleEventDto> {
    return this.service.updateStatus(id, dto.statusId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Cancel a schedule and take the patient off the board' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
