import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export const FLOOR_PLAN_KEY = 'default';

@Schema({ collection: 'floor_plans', timestamps: true, minimize: false })
export class FloorPlan {
  @Prop({ required: true, unique: true, default: FLOOR_PLAN_KEY })
  key: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  layout: Record<string, unknown>;

  @Prop({ type: String, default: null })
  updatedBy: string | null;

  createdAt?: Date;
  updatedAt?: Date;
}

export type FloorPlanDocument = HydratedDocument<FloorPlan>;
export const FloorPlanSchema = SchemaFactory.createForClass(FloorPlan);
