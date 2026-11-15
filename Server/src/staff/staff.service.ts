import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DEFAULT_STAFF, Staff, StaffRole, staffDisplayName } from './schemas/staff.schema';
import { CreateStaffDto, StaffResponseDto } from './dto/staff.dto';

type StaffLean = Staff & { _id: unknown };

function toResponse(doc: StaffLean): StaffResponseDto {
  return {
    _id: String(doc._id),
    role: doc.role,
    title: doc.title ?? '',
    firstName: doc.firstName,
    lastName: doc.lastName,
    displayName: staffDisplayName(doc),
  };
}

@Injectable()
export class StaffService implements OnModuleInit {
  constructor(@InjectModel(Staff.name) private readonly model: Model<Staff>) {}

  async onModuleInit() {
    if ((await this.model.estimatedDocumentCount()) > 0) return;
    await this.model.insertMany(DEFAULT_STAFF);
  }

  async list(role?: StaffRole): Promise<StaffResponseDto[]> {
    const docs = await this.model
      .find(role ? { role } : {})
      .sort({ lastName: 1, firstName: 1 })
      .lean();
    return docs.map((doc) => toResponse(doc as StaffLean));
  }

  async create(dto: CreateStaffDto): Promise<StaffResponseDto> {
    const doc = await this.model.create(dto);
    return toResponse(doc.toObject() as StaffLean);
  }

  async nameMap(): Promise<Map<string, string>> {
    const docs = await this.model.find().lean();
    return new Map(docs.map((doc) => [String(doc._id), staffDisplayName(doc)]));
  }
}
