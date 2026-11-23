import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ParseObjectIdPipe } from '../common/parse-object-id.pipe';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, TemplateResponseDto, UpdateTemplateDto } from './dto/template.dto';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly service: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'List published templates, newest first (built-in templates live in the client)' })
  @ApiOkResponse({ type: [TemplateResponseDto] })
  list(): Promise<TemplateResponseDto[]> {
    return this.service.list();
  }

  @Post()
  @ApiOperation({ summary: 'Publish a floor as a template' })
  @ApiCreatedResponse({ type: TemplateResponseDto })
  @ApiConflictResponse({ description: 'A template with that name already exists' })
  create(@Body() dto: CreateTemplateDto): Promise<TemplateResponseDto> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Rename or edit a template' })
  @ApiOkResponse({ type: TemplateResponseDto })
  @ApiNotFoundResponse()
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTemplateDto,
  ): Promise<TemplateResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a template' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
