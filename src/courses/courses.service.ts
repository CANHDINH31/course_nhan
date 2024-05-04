import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from 'src/schemas/courses.schema';
import { Model } from 'mongoose';
import { Lesson } from 'src/schemas/lessons.schema';
import { Test } from 'src/schemas/tests.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name) private courseModal: Model<Course>,
    @InjectModel(Lesson.name) private lessonModal: Model<Lesson>,
    @InjectModel(Test.name) private testModal: Model<Test>,
  ) {}

  async create(createCourseDto: CreateCourseDto, user) {
    try {
      const data = await this.courseModal.create({
        ...createCourseDto,
        teacher: user._id,
      });

      return {
        status: HttpStatus.CREATED,
        message: 'ADD NEW COURSE SUCCESSFULL',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(
    status: number,
    teacher: string,
    approve: number,
    title: string,
    rank: number,
    className: number,
    subject: number,
  ) {
    const query = {
      ...(teacher && { teacher: teacher }),
      ...(status && { status: Number(status) }),
      ...(approve && { approve: Number(approve) }),
      ...(title && { title: { $regex: title, $options: 'i' } }),
      ...(rank && { rank: Number(rank) }),
      ...(className && { class: Number(className) }),
      ...(subject && { subject: Number(subject) }),
    };

    try {
      const listCourse = await this.courseModal
        .find(query)
        .sort({ createdAt: -1 })
        .populate('teacher');

      const result = [];

      for (const course of listCourse) {
        const total = await this.lessonModal.countDocuments({
          course: course._id,
        });

        result.push({
          ...course.toObject(),
          totalLesson: total,
          totalTest: total,
        });
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async new() {
    try {
      const listCourse = await this.courseModal
        .find({ approve: 1 })
        .sort({ createdAt: -1 })
        .populate('teacher');

      const result = [];

      for (const course of listCourse) {
        const total = await this.lessonModal.countDocuments({
          course: course._id,
        });

        result.push({
          ...course.toObject(),
          totalLesson: total,
          totalTest: total,
        });
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const course = await this.courseModal.findById(id).populate('teacher');
      const arrLesson = await this.lessonModal
        .find({ course: course._id })
        .sort({ order: 1 });

      const listLesson = [];
      for (const lesson of arrLesson) {
        const test = await this.testModal.findOne({ lesson: lesson._id });
        listLesson.push({ ...lesson.toObject(), test: test || {} });
      }

      return {
        ...course.toObject(),
        listLesson,
      };
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    try {
      const data = await this.courseModal.findByIdAndUpdate(
        id,
        updateCourseDto,
        { new: true },
      );

      return {
        status: HttpStatus.CREATED,
        message: 'SUCCESSFULL',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
