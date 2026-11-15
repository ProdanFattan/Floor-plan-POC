import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { CreateStaffDto, StaffQueryDto, StaffResponseDto } from './dto/staff.dto';

@ApiTags('Staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly service: StaffService) {}

  @Get()
  @ApiOperation({ summary: 'List doctors and nurses (used for providers and room nurse assignment)' })
  @ApiOkResponse({ type: [StaffResponseDto] })
  list(@Query() query: StaffQueryDto): Promise<StaffResponseDto[]> {
    return this.service.list(query.role);
  }

  @Post()
  @ApiOperation({ summary: 'Add a doctor or nurse' })
  @ApiCreatedResponse({ type: StaffResponseDto })
  create(@Body() dto: CreateStaffDto): Promise<StaffResponseDto> {
    return this.service.create(dto);
  }
}
