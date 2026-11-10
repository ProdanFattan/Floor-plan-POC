import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

export const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/floor-plan-poc';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI || DEFAULT_MONGODB_URI),
  ],
})
export class AppModule {}