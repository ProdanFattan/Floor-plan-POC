import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const GENDERS = ['female', 'male', 'other', 'unknown'] as const;
export type Gender = (typeof GENDERS)[number];

@Schema({ collection: 'patients', timestamps: true })
export class Patient {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ default: '', trim: true })
  phn: string;

  @Prop({ type: String, default: null })
  dob: string | null;

  @Prop({ type: String, enum: GENDERS, default: 'unknown' })
  gender: Gender;

  @Prop({ default: '', trim: true })
  phone: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type PatientDocument = HydratedDocument<Patient>;
export const PatientSchema = SchemaFactory.createForClass(Patient);
PatientSchema.index({ lastName: 1, firstName: 1 });
PatientSchema.index({ phn: 1 });

export function patientFullName(patient: Pick<Patient, 'firstName' | 'lastName'>): string {
  return [patient.firstName, patient.lastName].filter(Boolean).join(' ').trim();
}
