import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  FLOOR_PLAN_LIVE_KEY,
  FloorPlanLive,
  LiveBedRow,
  LivePatientRow,
  LiveRoomRow,
} from './schemas/floor-plan-live.schema';
import {
  LivePatientRowDto,
  LiveRoomRowDto,
  LiveStateResponseDto,
  UpdateLiveStateDto,
} from './dto/floor-plan-live.dto';

type Coercer = (value: unknown) => unknown;

const toDateOrNull: Coercer = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? null : d;
};

const toNumberOrNull: Coercer = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const toStringOrNull: Coercer = (value) =>
  value === null || value === undefined || value === '' ? null : String(value);

const toStringOrEmpty: Coercer = (value) =>
  value === null || value === undefined ? '' : String(value);

function toBedList(value: unknown): LiveBedRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((bed) => bed && typeof bed === 'object' && (bed as LiveBedRow).bedId)
    .map((bed) => ({
      bedId: String((bed as LiveBedRow).bedId),
      bedStatus: toStringOrEmpty((bed as LiveBedRow).bedStatus) as string,
    }));
}

const PATIENT_FIELDS: Record<string, Coercer> = {
  patientId: toStringOrNull,
  scheduleDate: toStringOrNull,
  roomId: toStringOrNull,
  bedId: toStringOrNull,
  floorId: toStringOrNull,
  x: toNumberOrNull,
  y: toNumberOrNull,
  status: toStringOrEmpty,
  admittedAt: toDateOrNull,
  releaseAt: toDateOrNull,
  releasedAt: toDateOrNull,
};

const ROOM_FIELDS: Record<string, Coercer> = {
  floorId: toStringOrNull,
  cleaningStatus: toStringOrEmpty,
  lastCleanedAt: toDateOrNull,
  assignedNurses: (value) => (Array.isArray(value) ? value : []),
};

function emptyPatientRow(scheduleId: string, now: Date): LivePatientRow {
  return {
    scheduleId,
    patientId: null,
    scheduleDate: null,
    roomId: null,
    bedId: null,
    floorId: null,
    x: null,
    y: null,
    status: '',
    admittedAt: null,
    releaseAt: null,
    releasedAt: null,
    updatedAt: now,
  };
}

function emptyRoomRow(roomId: string, now: Date): LiveRoomRow {
  return {
    roomId,
    floorId: null,
    cleaningStatus: 'clean',
    lastCleanedAt: null,
    assignedNurses: [],
    beds: [],
    updatedAt: now,
  };
}

function applyFields<T extends object>(
  row: T,
  incoming: object,
  spec: Record<string, Coercer>,
  now: Date,
): T {
  const target = row as Record<string, unknown>;
  const source = incoming as Record<string, unknown>;
  Object.keys(spec).forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(source, field) && source[field] !== undefined) {
      target[field] = spec[field](source[field]);
    }
  });
  target.updatedAt = now;
  return row;
}

function isPlacedRow(row: LivePatientRow): boolean {
  return Boolean(row.roomId || row.bedId || (row.x != null && row.y != null));
}

function isCurrentRow(row: LivePatientRow, now: Date): boolean {
  if (!row.scheduleDate) return true;
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (row.scheduleDate >= cutoff) return true;
  const releaseAt = row.releaseAt ? new Date(row.releaseAt).getTime() : NaN;
  return Number.isFinite(releaseAt) && releaseAt > now.getTime();
}

function assertUniqueKeys(rows: object[], key: string, label: string) {
  const keys = rows.map((row) => String((row as Record<string, unknown>)[key]));
  if (new Set(keys).size !== keys.length) {
    throw new BadRequestException(`Duplicate ${key} in ${label}`);
  }
}

@Injectable()
export class FloorPlanLiveService {
  constructor(@InjectModel(FloorPlanLive.name) private readonly model: Model<FloorPlanLive>) {}

  async get(): Promise<LiveStateResponseDto> {
    const doc = await this.model.findOne({ key: FLOOR_PLAN_LIVE_KEY }).lean();
    return this.toResponse(doc);
  }

  async update(dto: UpdateLiveStateDto): Promise<LiveStateResponseDto> {
    const hasPatients = Array.isArray(dto.patients);
    const hasRooms = Array.isArray(dto.rooms);
    const isMerge = (dto.mode ?? 'merge') === 'merge';
    const removedIds = (dto.removedScheduleIds ?? []).filter(Boolean).map(String);

    if (!hasPatients && !hasRooms && !(isMerge && removedIds.length)) {
      throw new BadRequestException('Nothing to update — send a patients or rooms array');
    }

    const patients = dto.patients ?? [];
    const rooms = dto.rooms ?? [];
    assertUniqueKeys(patients, 'scheduleId', 'patients');
    assertUniqueKeys(rooms, 'roomId', 'rooms');

    const now = new Date();
    const existing = await this.model.findOne({ key: FLOOR_PLAN_LIVE_KEY }).lean();
    const set: Partial<Pick<FloorPlanLive, 'patients' | 'rooms'>> = {};

    if (isMerge) {
      if (hasPatients || removedIds.length) {
        set.patients = this.mergePatients(existing?.patients ?? [], patients, removedIds, now);
      }
      if (hasRooms) {
        set.rooms = this.mergeRooms(existing?.rooms ?? [], rooms, now);
      }
    } else {
      if (hasPatients) {
        set.patients = patients
          .map((row) => applyFields(emptyPatientRow(row.scheduleId, now), row, PATIENT_FIELDS, now))
          .filter((row) => isPlacedRow(row));
      }
      if (hasRooms) {
        set.rooms = rooms.map((row) => this.buildRoomRow(emptyRoomRow(row.roomId, now), row, now));
      }
    }

    const doc = await this.model
      .findOneAndUpdate({ key: FLOOR_PLAN_LIVE_KEY }, { $set: set }, { upsert: true, new: true, lean: true })
      .exec();
    return this.toResponse(doc);
  }

  async removeSchedule(scheduleId: string): Promise<void> {
    await this.model.updateOne(
      { key: FLOOR_PLAN_LIVE_KEY },
      { $pull: { patients: { scheduleId } } },
    );
  }

  private mergePatients(
    existing: LivePatientRow[],
    incoming: LivePatientRowDto[],
    removedIds: string[],
    now: Date,
  ): LivePatientRow[] {
    const removed = new Set(removedIds);
    const byId = new Map<string, LivePatientRow>();
    existing.forEach((row) => {
      if (row?.scheduleId && !removed.has(String(row.scheduleId))) {
        byId.set(String(row.scheduleId), { ...row });
      }
    });
    incoming.forEach((row) => {
      const key = String(row.scheduleId);
      const base = byId.get(key) ?? emptyPatientRow(key, now);
      byId.set(key, applyFields(base, row, PATIENT_FIELDS, now));
    });
    return Array.from(byId.values()).filter((row) => isPlacedRow(row) && isCurrentRow(row, now));
  }

  private mergeRooms(existing: LiveRoomRow[], incoming: LiveRoomRowDto[], now: Date): LiveRoomRow[] {
    const byId = new Map<string, LiveRoomRow>();
    existing.forEach((row) => {
      if (row?.roomId) byId.set(String(row.roomId), { ...row });
    });
    incoming.forEach((row) => {
      const key = String(row.roomId);
      byId.set(key, this.buildRoomRow(byId.get(key) ?? emptyRoomRow(key, now), row, now));
    });
    return Array.from(byId.values());
  }

  private buildRoomRow(base: LiveRoomRow, incoming: LiveRoomRowDto, now: Date): LiveRoomRow {
    const { beds, ...rest } = incoming;
    const row = applyFields(base, rest, ROOM_FIELDS, now);
    if (beds !== undefined) {
      const byId = new Map<string, LiveBedRow>();
      (base.beds ?? []).forEach((bed) => byId.set(String(bed.bedId), { ...bed }));
      toBedList(beds).forEach((bed) => byId.set(bed.bedId, bed));
      row.beds = Array.from(byId.values());
    }
    return row;
  }

  private toResponse(
    doc: { patients?: LivePatientRow[]; rooms?: LiveRoomRow[]; updatedAt?: Date } | null,
  ): LiveStateResponseDto {
    const iso = (value: Date | string | null | undefined) =>
      value ? new Date(value).toISOString() : null;
    return {
      patients: (doc?.patients ?? []).map((row) => ({
        scheduleId: row.scheduleId,
        patientId: row.patientId,
        scheduleDate: row.scheduleDate,
        roomId: row.roomId,
        bedId: row.bedId,
        floorId: row.floorId,
        x: row.x,
        y: row.y,
        status: row.status,
        admittedAt: iso(row.admittedAt),
        releaseAt: iso(row.releaseAt),
        releasedAt: iso(row.releasedAt),
      })),
      rooms: (doc?.rooms ?? []).map((row) => ({
        roomId: row.roomId,
        floorId: row.floorId,
        cleaningStatus: row.cleaningStatus,
        lastCleanedAt: iso(row.lastCleanedAt),
        assignedNurses: row.assignedNurses ?? [],
        beds: row.beds ?? [],
      })),
      updatedAt: iso(doc?.updatedAt),
    };
  }
}
