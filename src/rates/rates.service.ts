import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRateDto } from './dto/create-rate.dto';
import { UpdateRateDto } from './dto/update-rate.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rate } from 'src/schemas/rates.schema';
import { Lesson } from 'src/schemas/lessons.schema';
import { Result } from 'src/schemas/results.schema';

@Injectable()
export class RatesService {
  constructor(
    @InjectModel(Rate.name) private rateModal: Model<Rate>,
    @InjectModel(Lesson.name) private lessonModal: Model<Lesson>,
    @InjectModel(Result.name) private resultModal: Model<Result>,
  ) {}

  async create(createRateDto: CreateRateDto) {
    try {
      const existRate = await this.rateModal.findOne({
        user: createRateDto.user,
        course: createRateDto.course,
      });

      if (existRate)
        throw new BadRequestException({ messgae: 'Rate has been existed' });

      const listOrder = await this.resultModal
        .find({
          student: createRateDto.user,
          course: createRateDto.course,
        })
        .sort({ order: -1 });

      const lastOrder = listOrder?.[0]?.order;

      const totalLesson = await this.lessonModal.countDocuments({
        course: createRateDto.course,
      });

      if (lastOrder < totalLesson)
        throw new BadRequestException({
          messsage:
            'You must complete the course before the course can be rated',
        });

      const data = await this.rateModal.create(createRateDto);

      return {
        status: HttpStatus.CREATED,
        message: 'ADD NEW RATE SUCCESSFULL',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(course: string, user: string, content: string) {
    try {
      const query = {
        ...(course && { course: course }),
        ...(user && { user: user }),
        ...(content && { content: { $regex: content, $options: 'i' } }),
      };

      return await this.rateModal
        .find(query)
        .sort({ createdAt: -1 })
        .populate('course')
        .populate('user');
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return await this.rateModal
        .findById(id)
        .sort({ createdAt: -1 })
        .populate('course')
        .populate('user');
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateRateDto: UpdateRateDto) {
    try {
      const data = await this.rateModal.findByIdAndUpdate(id, updateRateDto, {
        new: true,
      });

      return {
        status: HttpStatus.CREATED,
        message: 'UPDATE RATE SUCCESSFULL',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.rateModal.findByIdAndDelete(id);
      return 'Delete successfully';
    } catch (error) {
      throw error;
    }
  }
}
