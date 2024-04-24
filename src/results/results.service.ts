import { LastOrderDto } from './dto/last-order.dto';
import { Injectable, BadRequestException, HttpStatus } from '@nestjs/common';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Result } from 'src/schemas/results.schema';
import { Model } from 'mongoose';
import { Test } from 'src/schemas/tests.schema';
import { MailerService } from '@nest-modules/mailer';
import { User } from 'src/schemas/users.schema';

@Injectable()
export class ResultsService {
  private readonly PASS_EXAM = 0.6;

  constructor(
    @InjectModel(Result.name) private resultModal: Model<Result>,
    @InjectModel(Test.name) private testModal: Model<Test>,
    @InjectModel(User.name) private userModal: Model<User>,
    private mailerService: MailerService,
  ) {}

  async lastOrder(lastOrderDto: LastOrderDto) {
    try {
      const listOrder = await this.resultModal
        .find({
          student: lastOrderDto.student,
          course: lastOrderDto.course,
        })
        .sort({ order: -1 });

      return { lastOrder: listOrder?.[0]?.order };
    } catch (error) {
      throw error;
    }
  }

  async create(createResultDto: CreateResultDto) {
    try {
      const existResult = await this.resultModal.findOne({
        student: createResultDto.student,
        test: createResultDto.test,
      });

      const parent = await this.userModal.findOne({
        children: createResultDto.student,
      });

      const student = await this.userModal.findById(createResultDto.student);

      const test: any = await this.testModal
        .findById(createResultDto.test)
        .populate({
          path: 'lesson',
          populate: {
            path: 'course',
          },
        });
      const qa = JSON.parse(test.qa);

      const arrayCorrect = qa.map((e) => e.correct);

      const numberCorrect = this.countCommonElements(
        createResultDto.answer?.split(','),
        arrayCorrect,
      );

      const perCorrect = numberCorrect / arrayCorrect?.length;

      if (perCorrect < this.PASS_EXAM) {
        if (parent) {
          await this.mailerService.sendMail({
            to: parent.email,
            subject: 'Notification of test results',
            html: `<h1>TEST INFO</h1>
            <p>Parent: ${parent?.name || ''}</p>
            <p>Student: ${student?.name}</p>
            <p>Course: ${test.lesson.course?.title}</p>
            <p>Lesson: ${test.lesson?.title}</p>
            <p>Test: ${test?.title}</p>
            <p>Totoal Question: ${arrayCorrect?.length}</p>
            <p>Total Correct: ${numberCorrect}</p>
            <p>Status: Failure</p>`,
          });
        }

        await this.mailerService.sendMail({
          to: student.email,
          subject: 'Notification of test results',
          html: `<h1>TEST INFO</h1>
          <p>Parent: ${parent?.name || ''}</p>
          <p>Student: ${student?.name}</p>
          <p>Course: ${test.lesson.course?.title}</p>
          <p>Lesson: ${test.lesson?.title}</p>
          <p>Test: ${test?.title}</p>
          <p>Totoal Question: ${arrayCorrect?.length}</p>
          <p>Total Correct: ${numberCorrect}</p>
          <p>Status: Failure</p>`,
        });

        throw new BadRequestException({ message: 'Not enough pass test' });
      }
      let data;
      if (existResult) {
        data = await this.resultModal.findByIdAndUpdate(
          existResult._id,
          {
            answer: createResultDto.answer,
            totalCorrect: numberCorrect,
            totalQuestion: arrayCorrect?.length,
          },
          { new: true },
        );
      } else {
        data = await this.resultModal.create({
          ...createResultDto,
          ...(parent && { parent: parent?._id }),
          lesson: test.lesson._id,
          course: test.lesson.course?._id,
          order: test.lesson.order,
          totalQuestion: arrayCorrect?.length,
          totalCorrect: numberCorrect,
        });
      }

      if (parent) {
        await this.mailerService.sendMail({
          to: parent.email,
          subject: 'Notification of test results',
          html: `<h1>TEST INFO</h1>
          <p>Parent: ${parent?.name || ''}</p>
          <p>Student: ${student?.name}</p>
          <p>Course: ${test.lesson.course?.title}</p>
          <p>Lesson: ${test.lesson?.title}</p>
          <p>Test: ${test?.title}</p>
          <p>Totoal Question: ${arrayCorrect?.length}</p>
          <p>Total Correct: ${numberCorrect}</p>
          <p>Status: Pass</p>`,
        });
      }

      await this.mailerService.sendMail({
        to: student.email,
        subject: 'Notification of test results',
        html: `<h1>TEST INFO</h1>
        <p>Parent: ${parent?.name || ''}</p>
        <p>Student: ${student?.name}</p>
        <p>Course: ${test.lesson.course?.title}</p>
        <p>Lesson: ${test.lesson?.title}</p>
        <p>Test: ${test?.title}</p>
        <p>Totoal Question: ${arrayCorrect?.length}</p>
        <p>Total Correct: ${numberCorrect}</p>
        <p>Status: Pass</p>`,
      });

      return {
        status: HttpStatus.CREATED,
        message: 'PASS TEST',
        data,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(
    parent: string,
    student: string,
    test: string,
    lesson: string,
    course: string,
  ) {
    try {
      const query = {
        ...(parent && { parent: parent }),
        ...(student && { student: student }),
        ...(test && { test: test }),
        ...(lesson && { lesson: lesson }),
        ...(course && { course: course }),
      };

      return await this.resultModal
        .find(query)
        .sort({ order: 1 })
        .populate('parent')
        .populate('student')
        .populate('test')
        .populate('lesson')
        .populate('course');
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return await this.resultModal
        .findById(id)
        .sort({ order: 1 })
        .populate('parent')
        .populate('student')
        .populate('test')
        .populate('lesson')
        .populate('course');
    } catch (error) {
      throw error;
    }
  }

  update(id: number, updateResultDto: UpdateResultDto) {
    return `This action updates a #${id} result`;
  }

  remove(id: number) {
    return `This action removes a #${id} result`;
  }

  countCommonElements(array1, array2) {
    if (array1.length !== array2.length) {
      return 0;
    }

    let count = 0;

    for (let i = 0; i < array1.length; i++) {
      if (array1[i] == array2[i]) {
        count++;
      }
    }

    return count;
  }
}
