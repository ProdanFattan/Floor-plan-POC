import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Schedule } from './schemas/schedule.schema';
import {
  CreateScheduleDto,
  ScheduleEventDto,
  ScheduleQueryDto,
  UpdateScheduleDto,
} from './dto/schedule.dto';
import { PatientsService } from '../patients/patients.service';
import { StaffService } from '../staff/staff.service';
import { StatusesService } from '../statuses/statuses.service';
import { FloorPlanLiveService } from '../floor-plan-live/floor-plan-live.service';
import { DEFAULT_STATUS_ID } from '../statuses/schemas/status.schema';

type ScheduleLean = Schedule & { _id: Types.ObjectId };

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(Schedule.name) private readonly model: Model<Schedule>,
    private readonly patients: PatientsService,
    private readonly staff: StaffService,
    private readonly statuses: StatusesService,
    private readonly live: FloorPlanLiveService,
  ) {}

  async list(query: ScheduleQueryDto): Promise<ScheduleEventDto[]> {
    const from = new Date(query.from);
    const to = new Date(query.to);
    if (from > to) throw new BadRequestException('"from" must be before "to"');

    const filter: FilterQuery<Schedule> = { start: { $gte: from, $lte: to } };
    if (query.medicalStaffId) filter.medicalStaffId = new Types.ObjectId(query.medicalStaffId);

    const docs = (await this.model.find(filter).sort({ start: 1 }).lean()) as ScheduleLean[];
    return this.toEvents(docs);
  }

  async get(id: string): Promise<ScheduleEventDto> {
    const doc = (await this.model.findById(id).lean()) as ScheduleLean | null;
    if (!doc) throw new NotFoundException('Schedule not found');
    return (await this.toEvents([doc]))[0];
  }

  async create(dto: CreateScheduleDto): Promise<ScheduleEventDto> {
    await this.patients.get(dto.patientId);
    this.assertRange(dto.start, dto.end);
    const statusId = dto.statusId ?? DEFAULT_STATUS_ID;
    await this.assertStatus(statusId);

    const doc = await this.model.create({
      ...dto,
      patientId: new Types.ObjectId(dto.patientId),
      medicalStaffId: dto.medicalStaffId ? new Types.ObjectId(dto.medicalStaffId) : null,
      start: new Date(dto.start),
      end: new Date(dto.end),
      statusId,
    });
    return this.get(String(doc._id));
  }

  async update(id: string, dto: UpdateScheduleDto): Promise<ScheduleEventDto> {
    const existing = await this.model.findById(id).lean();
    if (!existing) throw new NotFoundException('Schedule not found');
    if (dto.patientId) await this.patients.get(dto.patientId);
    if (dto.statusId) await this.assertStatus(dto.statusId);
    this.assertRange(dto.start ?? existing.start.toISOString(), dto.end ?? existing.end.toISOString());

    const set: Record<string, unknown> = { ...dto };
    if (dto.patientId) set.patientId = new Types.ObjectId(dto.patientId);
    if (dto.medicalStaffId !== undefined) {
      set.medicalStaffId = dto.medicalStaffId ? new Types.ObjectId(dto.medicalStaffId) : null;
    }
    if (dto.start) set.start = new Date(dto.start);
    if (dto.end) set.end = new Date(dto.end);

    await this.model.updateOne({ _id: id }, { $set: set });
    return this.get(id);
  }

  async updateStatus(id: string, statusId: string): Promise<ScheduleEventDto> {
    await this.assertStatus(statusId);
    const result = await this.model.updateOne({ _id: id }, { $set: { statusId } });
    if (!result.matchedCount) throw new NotFoundException('Schedule not found');
    return this.get(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Schedule not found');
    await this.live.removeSchedule(id);
  }

  private assertRange(start: string, end: string) {
    if (new Date(end).getTime() <= new Date(start).getTime()) {
      throw new BadRequestException('End time must be after start time');
    }
  }

  private async assertStatus(statusId: string) {
    if (!(await this.statuses.exists(statusId))) {
      throw new BadRequestException(`Unknown status "${statusId}"`);
    }
  }

  private async toEvents(docs: ScheduleLean[]): Promise<ScheduleEventDto[]> {
    if (!docs.length) return [];
    const [patients, staffNames, statusNames] = await Promise.all([
      this.patients.findMany([...new Set(docs.map((doc) => String(doc.patientId)))]),
      this.staff.nameMap(),
      this.statuses.nameMap(),
    ]);

    return docs.map((doc) => {
      const patient = patients.get(String(doc.patientId));
      const staffId = doc.medicalStaffId ? String(doc.medicalStaffId) : null;
      const start = doc.start.toISOString();
      return {
        _id: String(doc._id),
        patientId: String(doc.patientId),
        title: patient?.fullName || 'Unknown patient',
        phn: patient?.phn ?? '',
        start,
        end: doc.end.toISOString(),
        date: start,
        typeOfVisit: doc.typeOfVisit ?? '',
        visitReason: doc.visitReason ?? '',
        lastStatusId: doc.statusId,
        statusName: statusNames.get(doc.statusId) ?? doc.statusId,
        medicalStaffId: staffId,
        providerName: staffId ? staffNames.get(staffId) ?? '' : '',
        notes: doc.notes ?? '',
      };
    });
  }
}
