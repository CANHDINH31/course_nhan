import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSubDto } from './dto/create-sub.dto';
import { UpdateSubDto } from './dto/update-sub.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Sub } from 'src/schemas/subs.schema';
import { Model } from 'mongoose';
import { Course } from 'src/schemas/courses.schema';

@Injectable()
export class SubsService {
  constructor(
    @InjectModel(Sub.name) private subModal: Model<Sub>,
    @InjectModel(Course.name) private courseModal: Model<Course>,
  ) {}

  async create(createSubDto: CreateSubDto) {
    try {
      const existSub = await this.subModal.findOne({
        student: createSubDto.student,
        course: createSubDto.course,
      });

      if (existSub)
        throw new BadRequestException({
          message: 'This course has just subscribed',
        });

      const course = await this.courseModal.findById(createSubDto.course);

      const feeTeacher = (course.price * (100 - course.rose)) / 100;
      const feeAdmin = course.price - feeTeacher;

      const data = await this.subModal.create({
        ...createSubDto,
        feeAdmin,
        feeTeacher,
      });

      return {
        status: HttpStatus.CREATED,
        message: 'ADD NEW SUB SUCCESSFULL',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(parent: string, student: string, course: string) {
    try {
      const query = {
        ...(parent && { parent: parent }),
        ...(student && { student: student }),
        ...(course && { course: course }),
      };

      return this.subModal
        .find(query)
        .populate('parent')
        .populate('student')
        .populate('course');
    } catch (error) {
      throw error;
    }
  }

  async top() {
    try {
      const cash = await this.subModal.aggregate([
        {
          $group: {
            _id: '$course',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'courses',
            let: { course: '$_id' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$course'] } } }],
            as: 'course',
          },
        },
        {
          $unwind: '$course',
        },
        {
          $lookup: {
            from: 'users',
            localField: 'course.teacher',
            foreignField: '_id',
            as: 'course.teacher',
          },
        },
      ]);

      return cash;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return this.subModal
        .findById(id)
        .populate('parent')
        .populate('student')
        .populate('course');
    } catch (error) {
      throw error;
    }
  }

  update(id: number, updateSubDto: UpdateSubDto) {
    return `This action updates a #${id} sub`;
  }

  remove(id: number) {
    return `This action removes a #${id} sub`;
  }
}
