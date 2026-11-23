import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Template } from './schemas/template.schema';
import { CreateTemplateDto, TemplateResponseDto, UpdateTemplateDto } from './dto/template.dto';

type TemplateLean = Template & { _id: unknown };

function toResponse(doc: TemplateLean): TemplateResponseDto {
  return {
    _id: String(doc._id),
    name: doc.name,
    description: doc.description ?? '',
    category: doc.category ?? '',
    tags: doc.tags ?? [],
    ownerName: doc.ownerName ?? 'You',
    layout: doc.layout as unknown as TemplateResponseDto['layout'],
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : '',
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : '',
  };
}

function isDuplicateKey(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && (error as { code?: number }).code === 11000);
}

@Injectable()
export class TemplatesService {
  constructor(@InjectModel(Template.name) private readonly model: Model<Template>) {}

  async list(): Promise<TemplateResponseDto[]> {
    const docs = await this.model.find().sort({ createdAt: -1 }).lean();
    return docs.map((doc) => toResponse(doc as TemplateLean));
  }

  async create(dto: CreateTemplateDto): Promise<TemplateResponseDto> {
    try {
      const doc = await this.model.create({
        ...dto,
        name: dto.name.trim(),
        layout: dto.layout as unknown as Record<string, unknown>,
      });
      return toResponse(doc.toObject() as TemplateLean);
    } catch (error) {
      if (isDuplicateKey(error)) {
        throw new ConflictException(`A template named "${dto.name.trim()}" already exists`);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateTemplateDto): Promise<TemplateResponseDto> {
    try {
      const update: Partial<Template> = {
        ...dto,
        layout: dto.layout as unknown as Record<string, unknown> | undefined,
      };
      if (update.name !== undefined) update.name = update.name.trim();
      if (update.layout === undefined) delete update.layout;
      const doc = await this.model
        .findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true, lean: true })
        .exec();
      if (!doc) throw new NotFoundException('Template not found');
      return toResponse(doc as TemplateLean);
    } catch (error) {
      if (isDuplicateKey(error)) {
        throw new ConflictException(`A template named "${dto.name?.trim()}" already exists`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Template not found');
  }
}
