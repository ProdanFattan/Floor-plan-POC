import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export const STAFF_ROLES = ['doctor', 'nurse'] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

@Schema({ collection: 'staff', timestamps: true })
export class Staff {
  @Prop({ type: String, required: true, enum: STAFF_ROLES })
  role: StaffRole;

  @Prop({ default: '' })
  title: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;
}

export type StaffDocument = HydratedDocument<Staff>;
export const StaffSchema = SchemaFactory.createForClass(Staff);

export const DEFAULT_STAFF: Staff[] = [
  { role: 'doctor', title: 'Dr.', firstName: 'Amara', lastName: 'Okafor' },
  { role: 'doctor', title: 'Dr.', firstName: 'Liam', lastName: 'Chen' },
  { role: 'doctor', title: 'Dr.', firstName: 'Sofia', lastName: 'Rossi' },
  { role: 'nurse', title: 'RN', firstName: 'Grace', lastName: 'Mensah' },
  { role: 'nurse', title: 'RN', firstName: 'Noah', lastName: 'Williams' },
  { role: 'nurse', title: 'RN', firstName: 'Priya', lastName: 'Shah' },
];

export function staffDisplayName(staff: Pick<Staff, 'title' | 'firstName' | 'lastName'>): string {
  return [staff.title, staff.firstName, staff.lastName].filter(Boolean).join(' ').trim();
}
