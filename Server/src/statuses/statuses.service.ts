import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DEFAULT_STATUSES, Status } from './schemas/status.schema';
import { StatusResponseDto } from './dto/status.dto';

@Injectable()
export class StatusesService implements OnModuleInit {
  constructor(@InjectModel(Status.name) private readonly model: Model<Status>) {}

  async onModuleInit() {
    if ((await this.model.estimatedDocumentCount()) > 0) return;
    await this.model.insertMany(DEFAULT_STATUSES);
  }

  async list(): Promise<StatusResponseDto[]> {
    const docs = await this.model.find().sort({ order: 1 }).lean();
    return docs.map((doc) => ({
      _id: doc._id,
      name: doc.name,
      shortName: doc.shortName,
      color: doc.color,
      fnColor: doc.fnColor,
      order: doc.order,
      isDefault: doc.isDefault,
    }));
  }

  async exists(id: string): Promise<boolean> {
    return Boolean(await this.model.exists({ _id: id }));
  }

  async nameMap(): Promise<Map<string, string>> {
    const docs = await this.model.find({}, { name: 1 }).lean();
    return new Map(docs.map((doc) => [doc._id, doc.name]));
  }
}
