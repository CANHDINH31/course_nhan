import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from 'src/schemas/courses.schema';
import { Test, TestSchema } from 'src/schemas/tests.schema';
import { Lesson, LessonSchema } from 'src/schemas/lessons.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    MongooseModule.forFeature([{ name: Test.name, schema: TestSchema }]),
    MongooseModule.forFeature([{ name: Lesson.name, schema: LessonSchema }]),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
