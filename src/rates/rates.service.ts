import { BadRequestException, Injectable } from '@nestjs/common';
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

      return { lastOrder, totalLesson };
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all rates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rate`;
  }

  update(id: number, updateRateDto: UpdateRateDto) {
    return `This action updates a #${id} rate`;
  }

  remove(id: number) {
    return `This action removes a #${id} rate`;
  }
}
