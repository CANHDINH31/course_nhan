import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson } from 'src/schemas/lessons.schema';

@Injectable()
export class LessonsService {
  constructor(@InjectModel(Lesson.name) private lessonModal: Model<Lesson>) {}

  async create(createLessonDto: CreateLessonDto) {
    try {
      const data = await this.lessonModal.create(createLessonDto);

      return {
        status: HttpStatus.CREATED,
        message: 'ADD NEW LESSON SUCCESSFULL',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(course: string) {
    const query = {
      ...(course && { course: course }),
    };

    try {
      return await this.lessonModal
        .find(query)
        .sort({ order: 1 })
        .populate('course');
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} lesson`;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto) {
    try {
      const data = await this.lessonModal.findByIdAndUpdate(
        id,
        updateLessonDto,
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
    return `This action removes a #${id} lesson`;
  }
}
