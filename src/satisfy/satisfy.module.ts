import { Module } from '@nestjs/common';
import { SatisfyService } from './satisfy.service';
import { SatisfyController } from './satisfy.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from 'src/schemas/courses.schema';
import { User, UserSchema } from 'src/schemas/users.schema';
import { Sub, SubSchema } from 'src/schemas/subs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Sub.name, schema: SubSchema }]),
  ],
  controllers: [SatisfyController],
  providers: [SatisfyService],
})
export class SatisfyModule {}
