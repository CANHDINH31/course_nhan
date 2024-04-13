import { User } from 'src/schemas/users.schema';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from 'src/schemas/courses.schema';
import { Model } from 'mongoose';

@Injectable()
export class CoursesService {
  constructor(@InjectModel(Course.name) private courseModal: Model<Course>) {}

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

  async findAll(status: number, teacher: string) {
    const query = {
      ...(teacher && { teacher: teacher }),
      ...(status && { status: Number(status) }),
    };

    try {
      return await this.courseModal
        .find(query)
        .sort({ createdAt: -1 })
        .populate('teacher');
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
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
