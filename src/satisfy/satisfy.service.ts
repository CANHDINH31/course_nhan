import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from 'src/schemas/courses.schema';
import { Sub } from 'src/schemas/subs.schema';
import { User } from 'src/schemas/users.schema';

@Injectable()
export class SatisfyService {
  constructor(
    @InjectModel(Course.name) private courseModal: Model<Course>,
    @InjectModel(User.name) private userModal: Model<User>,
    @InjectModel(Sub.name) private subModal: Model<Sub>,
  ) {}

  async satifyAdmin() {
    try {
      const numberCourse = await this.courseModal.countDocuments({approve: 1});
      const numberStudent = await this.userModal.countDocuments({ role: 1 });
      const numberParent = await this.userModal.countDocuments({ role: 2 });
      const numberTeacher = await this.userModal.countDocuments({ role: 3, status: 1 });

      const fee = await this.subModal.aggregate([
        {
          $group: {
            _id: 'cash',
            feeTeacher: { $sum: '$feeTeacher' },
            feeAdmin: { $sum: '$feeAdmin' },
          },
        },
      ]);

      return {
        numberCourse,
        numberStudent,
        numberParent,
        numberTeacher,
        totalFreeTeacher: fee?.[0]?.feeTeacher,
        totalFreeAdmin: fee?.[0]?.feeAdmin,
      };
    } catch (error) {
      throw error;
    }
  }

  async satifyTeacher(id: string) {
    try {
      const listCourse = await this.courseModal.find({ teacher: id });
      const listIdCourse = listCourse?.map((c) => c._id);
      const listStudent = await this.subModal.find({
        course: { $in: listIdCourse },
      });

      const listIdStudent = listStudent?.map((c) => c._id);

      const listSub = await this.subModal.find({
        course: { $in: listIdCourse },
      });

      const totalFee = listSub?.reduce((a, b) => a + b.feeTeacher, 0);
      const coursesApprove = listCourse.filter(course => course.approve === 1)
      return {
        numberCourse: coursesApprove?.length,
        numberStudent: listIdStudent?.length,
        totalFee,
      };
    } catch (error) {
      throw error;
    }
  }

  async satifyParent(id: string) {
    try {
      const listSub = await this.subModal.find({
        parent: id,
      });

      return {
        listSub,
      };
    } catch (error) {
      throw error;
    }
  }

  async satifyStudent(id: string) {
    try {
      const listSub = await this.subModal.find({
        student: id,
      });

      return {
        listSub,
      };
    } catch (error) {
      throw error;
    }
  }
}
