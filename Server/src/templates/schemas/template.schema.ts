import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'floor_plan_templates', timestamps: true, minimize: false })
export class Template {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '' })
  category: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: 'You' })
  ownerName: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  layout: Record<string, unknown>;

  createdAt?: Date;
  updatedAt?: Date;
}

export type TemplateDocument = HydratedDocument<Template>;
export const TemplateSchema = SchemaFactory.createForClass(Template);
TemplateSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
