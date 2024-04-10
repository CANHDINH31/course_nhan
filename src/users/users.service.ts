import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/users.schema';
import { Model } from 'mongoose';
import { FindUserByEmailAndUsernameDto } from './dto/find-user-by-email-and-username.dto';
import { MoneyDto } from './dto/money-dto';
import { PasswordDto } from './dto/password-dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nest-modules/mailer';
import * as moment from 'moment';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModal: Model<User>,
    private mailerService: MailerService,
  ) {}

  private async onModuleInit() {
    await this.initCreateAdmin();
  }

  async initCreateAdmin() {
    try {
      const existAdmin = await this.userModal.findOne({ username: 'admin' });
      if (existAdmin) return;
      const password = await bcrypt.hash('123456789', 10);
      await this.userModal.create({
        name: 'admin',
        username: 'admin',
        password: password,
        role: 4,
      });
    } catch (error) {
      throw error;
    }
  }

  async statis(role: number) {
    if (role !== 3) {
      throw new BadRequestException({
        message: 'Chỉ admin mới xem được danh sách người dùng',
      });
    }
    try {
      const count_student = await this.userModal
        .find({ role: 1 })
        .countDocuments();
      const count_tutor = await this.userModal
        .find({ role: 2 })
        .countDocuments();
      return { count_student, count_tutor };
    } catch (error) {
      throw error;
    }
  }
  async create(createUserDto: CreateUserDto) {
    try {
      const userCreated = await this.userModal.create({ ...createUserDto });
      const { password, ...data } = userCreated.toObject();
      return {
        status: HttpStatus.CREATED,
        message: 'Thêm mới user thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async findByEmailAndUsername(
    findUserByEmailAndUsernameDto: FindUserByEmailAndUsernameDto,
  ) {
    try {
      const user = await this.userModal.find({
        $or: [
          { email: findUserByEmailAndUsernameDto.email },
          { username: findUserByEmailAndUsernameDto.username },
        ],
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async findByUsername(username: string) {
    try {
      const user = await this.userModal.findOne({ username });
      return user;
    } catch (error) {
      throw error;
    }
  }

  async findAll(role: number, status: number) {
    if (role !== 4) {
      throw new BadRequestException({
        message: 'You are not admin',
      });
    }
    // role:4 - admin

    const query: any = {
      role: { $ne: 4 },
      isDelete: 1,
    };

    if (status) {
      query.status = Number(status);
    }

    try {
      return await this.userModal
        .find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .populate('children');
    } catch (error) {
      throw error;
    }
  }

  async approveTeacher(role: number, id: string) {
    if (role !== 4) {
      throw new BadRequestException({
        message: 'You are not admin',
      });
    }
    // role:4 - admin

    try {
      const teacher = await this.userModal.findById(id);

      if (teacher?.role !== 3) {
        throw new BadRequestException({
          message: 'The user who needs approval is not teacher',
        });
      }

      await this.mailerService.sendMail({
        from: 'dinhphamcanh@gmail.com',
        to: teacher?.email,
        subject: 'Approve teacher notification',
        html: `You have been approved as an teacher`,
      });

      return await this.userModal.findByIdAndUpdate(id, { status: 1 });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return await this.userModal.findById(id);
    } catch (error) {}
  }

  async changePassword(passwordDto: PasswordDto, userId: string) {
    try {
      const existedAccount = await this.findOne(userId);

      if (!existedAccount) {
        throw new BadRequestException({
          message: 'Tài khoản của bạn không tồn tại',
        });
      }

      if (
        !(await bcrypt.compare(
          passwordDto.old_password,
          existedAccount.password,
        ))
      ) {
        throw new BadRequestException({
          message: 'Mật khẩu cũ không chính xác',
        });
      }

      const password = await bcrypt.hash(passwordDto.new_password, 10);

      await this.userModal.findByIdAndUpdate(userId, {
        password,
      });

      const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');

      await this.mailerService.sendMail({
        from: 'dinhphamcanh@gmail.com',
        to: existedAccount?.email,
        subject: 'Thông báo thay đổi mật khẩu',
        html: `
      <h1>Xác nhận thay đổi mật khẩu tài khoản ${existedAccount.username}</h1>
      <p>Vào thời gian ${currentDate} tài khoản của bạn trên hệ thống đã bị thay đổi mật khẩu. Nếu đó không phải là bạn xin hãy liên hệ ngay với đội ngũ quản trị viên để được hỗ trợ</p>
      `,
      });

      return {
        status: HttpStatus.CREATED,
        message: 'Thay đổi mật khẩu thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async changeInfo(updateUserDto: UpdateUserDto, userId: string) {
    try {
      const data = await this.userModal.findByIdAndUpdate(
        userId,
        updateUserDto,
        {
          new: true,
        },
      );
      return {
        status: HttpStatus.CREATED,
        message: 'Cập nhật thông tin thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async changeInfoByAdmin(updateUserDto: UpdateUserDto, role: number) {
    if (role !== 3) {
      throw new BadRequestException({
        message: 'Chỉ admin mới xem được cập nhật người dùng',
      });
    }
    try {
      const { _id, ...rest } = updateUserDto;
      const data = await this.userModal.findByIdAndUpdate(_id, rest, {
        new: true,
      });
      return {
        status: HttpStatus.CREATED,
        message: 'Cập nhật thông tin thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async block(id: string, role: number) {
    if (role !== 3) {
      throw new BadRequestException({
        message: 'Chỉ admin mới xem được khóa người dùng',
      });
    }
    try {
      const user = await this.userModal.findById(id);

      await user.save();
      return {
        status: HttpStatus.OK,
        message: 'Thay đổi trạng thái thành công',
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id, role: number) {
    if (role !== 4) {
      throw new BadRequestException({
        message: 'You are not admin',
      });
    }
    try {
      await this.userModal.findByIdAndUpdate(id, { isDelete: 0 });

      return {
        status: HttpStatus.OK,
        message: 'Xóa người dùng thành công',
      };
    } catch (error) {
      throw error;
    }
  }
}
