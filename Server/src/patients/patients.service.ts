import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { Patient, patientFullName } from './schemas/patient.schema';
import { CreatePatientDto, PatientResponseDto, UpdatePatientDto } from './dto/patient.dto';

type PatientLean = Patient & { _id: unknown };

export function toPatientResponse(doc: PatientLean): PatientResponseDto {
  return {
    _id: String(doc._id),
    firstName: doc.firstName,
    lastName: doc.lastName,
    fullName: patientFullName(doc),
    phn: doc.phn ?? '',
    dob: doc.dob ?? null,
    gender: doc.gender ?? 'unknown',
    phone: doc.phone ?? '',
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class PatientsService {
  constructor(@InjectModel(Patient.name) private readonly model: Model<Patient>) {}

  async list(search?: string): Promise<PatientResponseDto[]> {
    const filter: QueryFilter<Patient> = {};
    const terms = (search ?? '').trim().split(/\s+/).filter(Boolean);
    if (terms.length) {
      filter.$and = terms.map((term) => {
        const re = new RegExp(escapeRegex(term), 'i');
        return { $or: [{ firstName: re }, { lastName: re }, { phn: re }] };
      });
    }
    const docs = await this.model.find(filter).sort({ lastName: 1, firstName: 1 }).limit(50).lean();
    return docs.map((doc) => toPatientResponse(doc as PatientLean));
  }

  async get(id: string): Promise<PatientResponseDto> {
    const doc = await this.model.findById(id).lean();
    if (!doc) throw new NotFoundException('Patient not found');
    return toPatientResponse(doc as PatientLean);
  }

  async create(dto: CreatePatientDto): Promise<PatientResponseDto> {
    const doc = await this.model.create(dto);
    return toPatientResponse(doc.toObject() as PatientLean);
  }

  async update(id: string, dto: UpdatePatientDto): Promise<PatientResponseDto> {
    const doc = await this.model
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true, lean: true })
      .exec();
    if (!doc) throw new NotFoundException('Patient not found');
    return toPatientResponse(doc as PatientLean);
  }

  async remove(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Patient not found');
  }

  async findMany(ids: string[]): Promise<Map<string, PatientResponseDto>> {
    const docs = await this.model.find({ _id: { $in: ids } }).lean();
    return new Map(docs.map((doc) => [String(doc._id), toPatientResponse(doc as PatientLean)]));
  }
}
