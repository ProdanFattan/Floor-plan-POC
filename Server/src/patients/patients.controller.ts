import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { PatientsService } from './patients.service';
import {
  CreatePatientDto,
  PatientQueryDto,
  PatientResponseDto,
  UpdatePatientDto,
} from './dto/patient.dto';

@ApiTags('Patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly service: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'Search patients (max 50 results)' })
  @ApiOkResponse({ type: [PatientResponseDto] })
  list(@Query() query: PatientQueryDto): Promise<PatientResponseDto[]> {
    return this.service.list(query.search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one patient' })
  @ApiOkResponse({ type: PatientResponseDto })
  @ApiNotFoundResponse()
  get(@Param('id', ParseObjectIdPipe) id: string): Promise<PatientResponseDto> {
    return this.service.get(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a patient' })
  @ApiCreatedResponse({ type: PatientResponseDto })
  create(@Body() dto: CreatePatientDto): Promise<PatientResponseDto> {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a patient' })
  @ApiOkResponse({ type: PatientResponseDto })
  @ApiNotFoundResponse()
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdatePatientDto,
  ): Promise<PatientResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a patient' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
