import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Schedule, ScheduleSchema } from './schemas/schedule.schema';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { PatientsModule } from '../patients/patients.module';
import { StaffModule } from '../staff/staff.module';
import { StatusesModule } from '../statuses/statuses.module';
import { FloorPlanLiveModule } from '../floor-plan-live/floor-plan-live.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Schedule.name, schema: ScheduleSchema }]),
    PatientsModule,
    StaffModule,
    StatusesModule,
    FloorPlanLiveModule,
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}
