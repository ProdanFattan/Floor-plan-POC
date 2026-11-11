import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ collection: 'schedule_statuses', timestamps: true })
export class Status {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  shortName: string;

  @Prop({ required: true })
  color: string;

  @Prop({ default: '#FFFFFF' })
  fnColor: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: false })
  isDefault: boolean;
}

export type StatusDocument = HydratedDocument<Status>;
export const StatusSchema = SchemaFactory.createForClass(Status);

export const DEFAULT_STATUS_ID = 'scheduled';

export const DEFAULT_STATUSES: Status[] = [
  { _id: 'scheduled', name: 'Scheduled', shortName: 'SC', color: '#64748B', fnColor: '#FFFFFF', order: 1, isDefault: true },
  { _id: 'waiting', name: 'Waiting', shortName: 'WT', color: '#F59E0B', fnColor: '#1F2937', order: 2, isDefault: false },
  { _id: 'checked-in', name: 'Checked In', shortName: 'CI', color: '#0EA5E9', fnColor: '#FFFFFF', order: 3, isDefault: false },
  { _id: 'in-progress', name: 'In Progress', shortName: 'IP', color: '#8B5CF6', fnColor: '#FFFFFF', order: 4, isDefault: false },
  { _id: 'lab', name: 'Lab', shortName: 'LB', color: '#14B8A6', fnColor: '#FFFFFF', order: 5, isDefault: false },
  { _id: 'completed', name: 'Completed', shortName: 'CP', color: '#16A34A', fnColor: '#FFFFFF', order: 6, isDefault: false },
  { _id: 'left', name: 'Left', shortName: 'LF', color: '#6B7280', fnColor: '#FFFFFF', order: 7, isDefault: false },
  { _id: 'no-show', name: 'No Show', shortName: 'NS', color: '#DC2626', fnColor: '#FFFFFF', order: 8, isDefault: false },
];
