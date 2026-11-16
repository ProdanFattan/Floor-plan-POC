import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FloorPlan, FloorPlanSchema } from './schemas/floor-plan.schema';
import { FloorPlanService } from './floor-plan.service';
import { FloorPlanController } from './floor-plan.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: FloorPlan.name, schema: FloorPlanSchema }])],
  controllers: [FloorPlanController],
  providers: [FloorPlanService],
  exports: [FloorPlanService],
})
export class FloorPlanModule {}
