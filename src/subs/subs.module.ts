import { Module } from '@nestjs/common';
import { SubsService } from './subs.service';
import { SubsController } from './subs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sub, SubSchema } from 'src/schemas/subs.schema';
import { Course, CourseSchema } from 'src/schemas/courses.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sub.name, schema: SubSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [SubsController],
  providers: [SubsService],
})
export class SubsModule {}
