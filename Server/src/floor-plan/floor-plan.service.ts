import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FloorPlan, FLOOR_PLAN_KEY } from './schemas/floor-plan.schema';
import { FloorPlanResponseDto, SaveFloorPlanDto } from './dto/floor-plan.dto';
import { LayoutDto } from './dto/layout.dto';

const LAYOUT_KEYS = ['floors', 'boundary', 'walls', 'doors', 'rooms', 'labels', 'customRoomTypes'] as const;

@Injectable()
export class FloorPlanService {
  constructor(@InjectModel(FloorPlan.name) private readonly model: Model<FloorPlan>) {}

  async get(): Promise<FloorPlanResponseDto> {
    const doc = await this.model.findOne({ key: FLOOR_PLAN_KEY }).lean();
    if (!doc) return { layout: null, updatedAt: null, updatedBy: null };
    return {
      layout: doc.layout as unknown as LayoutDto,
      updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : null,
      updatedBy: doc.updatedBy ?? null,
    };
  }

  async save(dto: SaveFloorPlanDto): Promise<FloorPlanResponseDto> {
    const source = dto.layout as unknown as Record<string, unknown>;
    const layout: Record<string, unknown> = {};
    LAYOUT_KEYS.forEach((key) => {
      if (source[key] !== undefined) layout[key] = source[key];
    });
    ['walls', 'doors', 'rooms', 'labels', 'floors'].forEach((key) => {
      if (!Array.isArray(layout[key])) layout[key] = [];
    });

    const doc = await this.model
      .findOneAndUpdate(
        { key: FLOOR_PLAN_KEY },
        { $set: { layout, updatedBy: dto.updatedBy ?? null } },
        { upsert: true, new: true, lean: true },
      )
      .exec();

    return {
      layout: doc!.layout as unknown as LayoutDto,
      updatedAt: doc!.updatedAt ? doc!.updatedAt.toISOString() : null,
      updatedBy: doc!.updatedBy ?? null,
    };
  }
}
