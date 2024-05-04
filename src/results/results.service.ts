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
        // if (parent) {
        //   // gửi kết quả test đến parent
        //   await this.mailerService.sendMail({
        //     to: parent.email,
        //     subject: 'Notification of test results',
        //     html: `<h1>TEST INFO</h1>
        //     <p>Parent: ${parent?.name || ''}</p>
        //     <p>Student: ${student?.name}</p>
        //     <p>Course: ${test.lesson.course?.title}</p>
        //     <p>Lesson: ${test.lesson?.title}</p>
        //     <p>Test: ${test?.title}</p>
        //     <p>Totoal Question: ${arrayCorrect?.length}</p>
        //     <p>Total Correct: ${numberCorrect}</p>
        //     <p>Status: Failure</p>`,
        //   });
        // }

        // await this.mailerService.sendMail({
        //   to: student.email,
        //   subject: 'Notification of test results',
        //   html: `<h1>TEST INFO</h1>
        //   <p>Parent: ${parent?.name || ''}</p>
        //   <p>Student: ${student?.name}</p>
        //   <p>Course: ${test.lesson.course?.title}</p>
        //   <p>Lesson: ${test.lesson?.title}</p>
        //   <p>Test: ${test?.title}</p>
        //   <p>Totoal Question: ${arrayCorrect?.length}</p>
        //   <p>Total Correct: ${numberCorrect}</p>
        //   <p>Status: Failure</p>`,
        // });

        throw new BadRequestException({ message: 'Bạn không đủ điểm vượt qua bài kiểm tra' });
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
      const dateCreated = require('moment')().format('DD/MM/YYYY HH:mm');
      const examScores = (numberCorrect / (arrayCorrect?.length)) * 100
      if (parent) {
        await this.mailerService.sendMail({
          to: parent.email,
          subject: 'Thông báo kết quả bài kiểm tra',
          // html: `<h1>TEST INFO</h1>
          // <p>Parent: ${parent?.name || ''}</p>
          // <p>Student: ${student?.name}</p>
          // <p>Course: ${test.lesson.course?.title}</p>
          // <p>Lesson: ${test.lesson?.title}</p>
          // <p>Test: ${test?.title}</p>
          // <p>Totoal Question: ${arrayCorrect?.length}</p>
          // <p>Total Correct: ${numberCorrect}</p>
          // <p>Exam scores: ${examScores}%</p>
          // <p>Date finished: ${dateCreated}
          // <p>Status: Pass</p>`,
          html: `
          <body>
            <div style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                <div
                    style="max-width: 600px; box-sizing: border-box; margin: 0 auto; padding: 20px; padding-left: 50px; background-color: #ffffff;
              border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                    <div ><h2 style="text-align: center; color: rgb(243, 94, 8); font-size: 30px;">Kết quả bài kiểm tra</h2></div>
                    <div style="margin: 20px 0; font-size: 16px;">
                        
                        <p>Xin chào <strong style="color: rgb(29, 29, 246);">${parent?.name || ''}</strong>!</p>
                        <p>Chúng tôi gửi bảng kết quả bài kiểm tra của con bạn.</p>
                    </div>
                    <table
                        style="width: 70%; border-collapse: collapse; margin-left: auto; margin-right: auto; font-size: 13px;">
                        <thead>
                            <tr>
                                <th
                                    style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; width: 35%; background-color: #f2f2f2; text-align: center;">
                                </th>
                                <th
                                    style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2; text-align: center;">
                                    Thông tin</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; width: 35%;">Phụ
                                    huynh</td>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; font-weight: bold;">
                                    ${parent?.name || ''}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; width: 35%;">Học viên
                                </td>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; font-weight: bold;">
                                    ${student?.name}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; width: 35%;">Khóa học
                                </td>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; font-weight: bold;">
                                    ${test.lesson.course?.title}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; width: 35%;">Bài học
                                </td>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; font-weight: bold;">
                                    ${test.lesson?.title}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; width: 35%;">Bài kiểm
                                    tra</td>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; font-weight: bold;">
                                    ${test?.title}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; width: 35%;">Điểm bài
                                    kiểm tra</td>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; font-weight: bold;">
                                    ${numberCorrect}/${arrayCorrect?.length} (${examScores}%) </td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; width: 35%;">Ngày
                                    hoàn thành</td>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; font-weight: bold;">
                                    ${dateCreated}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; width: 35%;">Trạng
                                    thái</td>
                                <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd; font-weight: bold;">
                                    Vượt qua</td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="font-size: 16px;">
                        <p>Chúc mừng con bạn đã vượt qua bài kiểm tra và được mở bài học mới.</p>
                        <p>Hãy chờ kết quả của bài học mới.</p>
                        <hr width="85%" align="center" style="margin-top: 50px;" />
                        <p
                            style="font-size: 14px; font-style: italic; line-height: 20px; color: #4a4848; text-align: center; margin: 0;">
                            Đây là email được gửi tự động từ hệ thống. <br>Mọi thông tin cần hỗ trợ xin vui lòng liên hệ qua địa
                            chỉ: <span style="color: rgb(64, 64, 225); text-decoration: none;">otlichno.edu@gmail.com</span>
                            hoặc số điện thoại +79533733420</p>
                    </div>
                </div>
            </div>
          </body>
          `
        });
      }

      // await this.mailerService.sendMail({
      //   to: student.email,
      //   subject: 'Notification of test results',
      //   html: `<h1>TEST INFO</h1>
      //   <p>Parent: ${parent?.name || ''}</p>
      //   <p>Student: ${student?.name}</p>
      //   <p>Course: ${test.lesson.course?.title}</p>
      //   <p>Lesson: ${test.lesson?.title}</p>
      //   <p>Test: ${test?.title}</p>
      //   <p>Totoal Question: ${arrayCorrect?.length}</p>
      //   <p>Total Correct: ${numberCorrect}</p>
      //   <p>Status: Pass</p>`,
      // });

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
