import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { DEFAULT_STATUS_ID } from '../../statuses/schemas/status.schema';

@Schema({ collection: 'schedules', timestamps: true })
export class Schedule {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Patient', required: true, index: true })
  patientId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Staff', default: null })
  medicalStaffId: Types.ObjectId | null;

  @Prop({ type: Date, required: true, index: true })
  start: Date;

  @Prop({ type: Date, required: true })
  end: Date;

  @Prop({ default: '' })
  typeOfVisit: string;

  @Prop({ default: '' })
  visitReason: string;

  @Prop({ type: String, default: DEFAULT_STATUS_ID })
  statusId: string;

  @Prop({ default: '' })
  notes: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type ScheduleDocument = HydratedDocument<Schedule>;
export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

export const VISIT_TYPES = ['Consultation', 'Follow-up', 'Walk-in', 'Lab work', 'Procedure', 'Admission'];
