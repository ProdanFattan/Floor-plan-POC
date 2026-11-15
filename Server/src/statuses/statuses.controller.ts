import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatusesService } from './statuses.service';
import { StatusResponseDto } from './dto/status.dto';

@ApiTags('Statuses')
@Controller('statuses')
export class StatusesController {
  constructor(private readonly service: StatusesService) {}

  @Get()
  @ApiOperation({ summary: 'List schedule statuses in board order' })
  @ApiOkResponse({ type: [StatusResponseDto] })
  list(): Promise<StatusResponseDto[]> {
    return this.service.list();
  }
}
