import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FloorPlanLive, FloorPlanLiveSchema } from './schemas/floor-plan-live.schema';
import { FloorPlanLiveService } from './floor-plan-live.service';
import { FloorPlanLiveController } from './floor-plan-live.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: FloorPlanLive.name, schema: FloorPlanLiveSchema }])],
  controllers: [FloorPlanLiveController],
  providers: [FloorPlanLiveService],
  exports: [FloorPlanLiveService],
})
export class FloorPlanLiveModule {}
