import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lesson } from 'src/schemas/lessons.schema';
import { Test } from 'src/schemas/tests.schema';
import { Comment } from 'src/schemas/comments.schema';

@Injectable()
export class LessonsService {
  constructor(
    @InjectModel(Lesson.name) private lessonModal: Model<Lesson>,
    @InjectModel(Test.name) private testModal: Model<Test>,
    @InjectModel(Comment.name) private commentModal: Model<Comment>,
  ) {}

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
      const listLesson = await this.lessonModal
        .find(query)
        .sort({ order: 1 })
        .populate('course');

      const listResult = [];
      for (const lesson of listLesson) {
        const test = await this.testModal.findOne({ lesson: lesson._id });
        listResult.push({ ...lesson.toObject(), test });
      }
      return listResult;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const lesson = await this.lessonModal.findById(id);
      const test = await this.testModal.findOne({ lesson: lesson._id });

      return {
        ...lesson.toObject(),
        test,
      };
    } catch (error) {}
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

  async remove(id: string) {
    try {
      await this.testModal.deleteMany({ lesson: id });
      await this.commentModal.deleteMany({ lesson: id });
      await this.lessonModal.findByIdAndDelete(id);

      return 'DELETE SUCCESSFULLY';
    } catch (error) {}
  }
}
