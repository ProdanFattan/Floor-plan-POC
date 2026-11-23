import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export const FLOOR_PLAN_LIVE_KEY = 'default';

export interface LiveBedRow {
  bedId: string;
  bedStatus: string;
}

export interface LivePatientRow {
  scheduleId: string;
  patientId: string | null;
  scheduleDate: string | null;
  roomId: string | null;
  bedId: string | null;
  floorId: string | null;
  x: number | null;
  y: number | null;
  status: string;
  admittedAt: Date | null;
  releaseAt: Date | null;
  releasedAt: Date | null;
  updatedAt: Date;
}

export interface LiveRoomRow {
  roomId: string;
  floorId: string | null;
  cleaningStatus: string;
  lastCleanedAt: Date | null;
  assignedNurses: unknown[];
  beds: LiveBedRow[];
  updatedAt: Date;
}

@Schema({ collection: 'floor_plan_live', timestamps: true, minimize: false })
export class FloorPlanLive {
  @Prop({ required: true, unique: true, default: FLOOR_PLAN_LIVE_KEY })
  key: string;

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  patients: LivePatientRow[];

  @Prop({ type: [MongooseSchema.Types.Mixed], default: [] })
  rooms: LiveRoomRow[];

  createdAt?: Date;
  updatedAt?: Date;
}

export type FloorPlanLiveDocument = HydratedDocument<FloorPlanLive>;
export const FloorPlanLiveSchema = SchemaFactory.createForClass(FloorPlanLive);
