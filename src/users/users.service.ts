import { ResetPassordDto } from './dto/reset-password-dto';
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
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from './dto/forgot-password-dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModal: Model<User>,
    private mailerService: MailerService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async onModuleInit() {
    await this.initCreateAdmin();
  }

  async initCreateAdmin() {
    try {
      const existAdmin = await this.userModal.findOne({ username: 'admin' });
      if (existAdmin) return;
      const password = await bcrypt.hash('Admin123456!', 10);
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
    if (role !== 4) {
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

  async findAll(status: number, role: number) {
    const query = {
      ...(status && { status: Number(status) }),
      ...(role && { role: Number(role) }),
    };

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
        message: 'Bạn không phải là admin',
      });
    }
    // role:4 - admin

    try {
      const teacher = await this.userModal.findById(id);

      if (teacher?.role !== 3) {
        throw new BadRequestException({
          message: 'Người dùng cần phê duyệt không phải là giáo viên',
        });
      }

      // gửi mail phê duyệt giáo viên
      await this.mailerService.sendMail({
        // from: 'otlichno.edu@gmail.com',
        to: teacher?.email,
        subject: 'Xác nhận tài khoản thành công',
        html: `
        <body style="margin: 0; padding: 0; background-color: #ffffff;">
          <center>
              <div style="width: 700px; max-height: 600px; background-color: #f6f2f2; padding:10px 0 40px 0;">
                  <table cellpadding="0" cellspacing="0" width="100%"
                      style="max-width: 500px; margin-top: 30px; background-color: #f8f8f8; border: 1px solid #c7c3c3;">
                      <tr>
                          <td align="center" style="padding: 10px 0 10px 0; background-color: #aad58a;">
                              <h1 style="font-size: 24px; margin-bottom: 20px;">Xác nhận tài khoản thành công</h1>
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 20px 40px;">
                              <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Xin chào <strong style="color: rgb(50, 50, 226);">${teacher?.name}</strong>!</p>
                              <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Chúc mừng bạn đã được xác nhận tài khoản thành công.</p>
                              <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Chúng tôi rất mong rằng hệ thống sẽ phát triển đa dạng hơn với sự đóng góp của bạn.</p>

                              <br>
                              <p style="font-size: 16px; ">Cảm ơn đã sử dụng dịch vụ của <strong>Otlichno Education!</strong></p>
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px 30px 20px;">
                              <hr  width="85%" align="center" />
                              <p style="font-size: 14px; font-style: italic; line-height: 20px; color: #4a4848; text-align: center; margin: 0;">
                                  Đây là email được gửi tự động từ hệ thống. <br>Mọi thông tin cần hỗ trợ xin vui lòng liên hệ qua địa chỉ: <span style="color: rgb(64, 64, 225); text-decoration: none;">otlichno.edu@gmail.com</span>
                                  hoặc số điện thoại +79533733420</p>
                          </td>
                      </tr>
                  </table>
              </div>
          </center>
        </body>
        `,
      });

      return await this.userModal.findByIdAndUpdate(id, { status: 1 });
    } catch (error) {
      throw error;
    }
  }

  async rejectTeacher(role: number, id: string) {
    if (role !== 4) {
      throw new BadRequestException({
        message: 'Bạn không phải là admin',
      });
    }
    // role:4 - admin

    try {
      const teacher = await this.userModal.findById(id);

      if (teacher?.role !== 3) {
        throw new BadRequestException({
          message: 'Người dùng cần phê duyệt không phải là giáo viên',
        });
      }

      // gửi mail từ chối đăng ký giáo viên
      await this.mailerService.sendMail({
        // from: 'otlichno.edu@gmail.com',
        to: teacher?.email,
        subject: 'Xác nhận tài khoản thất bại',
        html: `
        <body style="margin: 0; padding: 0; background-color: #ffffff;">
            <center>
                <div style="width: 700px; max-height: 600px; background-color: #f6f2f2; padding:10px 0 40px 0;">
                    <table cellpadding="0" cellspacing="0" width="100%"
                        style="max-width: 500px; margin-top: 30px; background-color: #f8f8f8; border: 1px solid #c7c3c3;">
                        <tr>
                            <td align="center" style="padding: 10px 0 10px 0; background-color: #ea9e96;">
                                <h1 style="font-size: 24px; margin-bottom: 20px;">Xác nhận tài khoản thất bại</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 40px;">
                                <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Xin chào <strong style="color: rgb(50, 50, 226);">${teacher?.name}</strong>!</p>
                                <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Rất tiếc việc xác nhận tài khoản của bạn bị thất bại.</p>
                                <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Vui lòng kiểm tra lại chứng chỉ và thông tin của bạn. Hãy đăng ký lại khi mọi thông tin đã chính xác.</p>
                                <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Chúng tôi mong rằng việc xác nhận đăng ký tài khoản sẽ thành công trong lần tới.</p>
                                <br>
                                <p style="font-size: 16px; ">Cảm ơn đã sử dụng dịch vụ của <strong>Otlichno Education!</strong></p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 20px 30px 20px;">
                                <hr  width="85%" align="center" />
                                <p style="font-size: 14px; font-style: italic; line-height: 20px; color: #4a4848; text-align: center; margin: 0;">
                                    Đây là email được gửi tự động từ hệ thống. <br>Mọi thông tin cần hỗ trợ xin vui lòng liên hệ qua địa chỉ: <span style="color: rgb(64, 64, 225); text-decoration: none;">otlichno.edu@gmail.com</span>
                                    hoặc số điện thoại +79533733420</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </center>
        </body>
        `,
      });

      await this.userModal.deleteOne({ _id: id });

      return {
        status: HttpStatus.CREATED,
        message: 'Reject',
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return await this.userModal.findById(id).populate('children');
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

      // gửi mail thay đổi mật khẩu
      await this.mailerService.sendMail({
        // from: 'otlichno.edu@gmail.com',
        to: existedAccount?.email,
        subject: 'Thay đổi mật khẩu thành công',
        html: `
        <body style="margin: 0; padding: 0; background-color: #ffffff;">
          <center>
              <div style="width: 700px; max-height: 600px; background-color: #f6f2f2; padding:10px 0 40px 0;">
                  <table cellpadding="0" cellspacing="0" width="100%"
                      style="max-width: 500px; margin-top: 30px; background-color: #f8f8f8; border: 1px solid #c7c3c3;">
                      <tr>
                          <td align="center" style="padding: 10px 0 10px 0; background-color: #aad58a;">
                              <h1 style="font-size: 24px; margin-bottom: 20px;">Thay đổi mật khẩu thành công</h1>
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 20px 40px;">
                              <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Xin chào <strong style="color: rgb(50, 50, 226);">${existedAccount?.name}</strong>!</p>
                              <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Chúng tôi thông báo tài khoản <strong>${existedAccount.username}</strong> đã thay đổi mật khẩu trên hệ thống vào lúc ${currentDate}.</p>
                              <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;"><strong>Nếu đó không phải là bạn</strong>, xin hãy liên hệ ngay với đội ngũ quản trị viên của Otlichno để được hỗ trợ.</p>

                              <br>
                              <p style="font-size: 16px; ">Cảm ơn đã sử dụng dịch vụ của <strong>Otlichno Education!</strong></p>
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px 30px 20px;">
                              <hr  width="85%" align="center" />
                              <p style="font-size: 14px; font-style: italic; line-height: 20px; color: #4a4848; text-align: center; margin: 0;">
                                  Đây là email được gửi tự động từ hệ thống. <br>Mọi thông tin cần hỗ trợ xin vui lòng liên hệ qua địa chỉ: <span style="color: rgb(64, 64, 225); text-decoration: none;">otlichno.edu@gmail.com</span>
                                  hoặc số điện thoại +79533733420</p>
                          </td>
                      </tr>
                  </table>
              </div>
          </center>
        </body>
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.userModal.findOne({
        email: forgotPasswordDto.email,
      });
      if (!user)
        throw new BadRequestException({
          message: 'Email không tồn tại',
        });

      const { password, ...data } = user.toObject();

      const token = await this.jwtService.signAsync(data, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '5m',
      });
      
      // gửi mail quên mật khẩu
      await this.mailerService.sendMail({
        // from: 'otlichno.edu@gmail.com',
        to: user.email,
        subject: 'Khôi phục mật khẩu',
        html: `
          <body style="margin: 0; padding: 0; background-color: #ffffff;">
            <center>
                <div style="width: 700px; max-height: 600px; background-color: #f6f2f2; padding:10px 0 40px 0;">
                    <table cellpadding="0" cellspacing="0" width="100%"
                        style="max-width: 500px; margin-top: 30px; background-color: #f8f8f8; border: 1px solid #c7c3c3;">
                        <tr>
                            <td align="center" style="padding: 10px 0 10px 0; background-color: #aad58a;">
                                <h1 style="font-size: 24px; margin-bottom: 20px;">Quên mật khẩu</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 40px;">
                                <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Xin chào <strong style="color: rgb(50, 50, 226);">${user?.name}</strong>!</p>
                                <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu Otlichno của bạn.</p>
                                <a style="font-size: 16px; line-height: 24px; margin-bottom: 20px;  font-style: italic; text-decoration: none;" href="${this.configService.get('DOMAIN_WEB',)}/auth/reset-password?token=${token}">Nhấn vào đây để đặt lại mật khẩu của bạn.</a>
                                <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;"><strong>Nếu đó không phải là bạn</strong>, xin hãy liên hệ ngay với đội ngũ quản trị viên của Otlichno để được hỗ trợ.</p>
                                <br>
                                <p style="font-size: 16px; ">Cảm ơn đã sử dụng dịch vụ của <strong>Otlichno Education!</strong></p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 20px 30px 20px;">
                                <hr  width="85%" align="center" />
                                <p style="font-size: 14px; font-style: italic; line-height: 20px; color: #4a4848; text-align: center; margin: 0;">
                                    Đây là email được gửi tự động từ hệ thống. <br>Mọi thông tin cần hỗ trợ xin vui lòng liên hệ qua địa chỉ: <span style="color: rgb(64, 64, 225); text-decoration: none;">otlichno.edu@gmail.com</span>
                                    hoặc số điện thoại +79533733420</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </center>
          </body>
        `,
      });

      return {
        status: HttpStatus.OK,
        data: { email: data.email },
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(resetPassordDto: ResetPassordDto) {
    try {
      const decode = await this.jwtService.verify(resetPassordDto.token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const password = await bcrypt.hash(resetPassordDto.password, 10);
      const data = await this.userModal.findByIdAndUpdate(
        decode._id,
        { password },
        { new: true },
      );
      return {
        status: HttpStatus.OK,
        message: 'Cập nhật mật khẩu thành công',
        data,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Hết thời gian thay đổi mật khẩu');
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

  async blockAccount(updateUserDto: UpdateUserDto, userId: string) {
    try {
      const data = await this.userModal.findByIdAndUpdate(
        userId,
        updateUserDto,
        {
          new: true,
        },
      );
      if (updateUserDto?.enable === 0) {
        await this.mailerService.sendMail({
          // from: 'otlichno.edu@gmail.com',
          to: data?.email,
          subject: 'Tài khoản bị khóa',
          html: `
          <body style="margin: 0; padding: 0; background-color: #ffffff;">
          <center>
              <div style="width: 700px; max-height: 600px; background-color: #f6f2f2; padding:10px 0 40px 0;">
                  <table cellpadding="0" cellspacing="0" width="100%"
                      style="max-width: 500px; margin-top: 30px; background-color: #f8f8f8; border: 1px solid #c7c3c3;">
                      <tr>
                          <td align="center" style="padding: 10px 0 10px 0; background-color: #ea9e96;">
                              <h1 style="font-size: 24px; margin-bottom: 20px;">Tài khoản của bạn bị khóa</h1>
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 20px 40px;">
                              <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Xin chào <strong style="color: rgb(50, 50, 226);">${data?.name}</strong>!</p>
                              <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Rất tiếc thông báo rằng tài khoản của bạn đã bị khóa vì bạn đã vi phạm tiêu chuẩn cộng đồng.</p>
                              <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Để biết rõ hơn vui lòng truy cập website và xem mục <strong>Tiêu chuẩn cộng đồng</strong>.</p>
                              <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;"></p>

                              <br>
                              <p style="font-size: 16px; ">Mọi khiếu nại hoặc cần hỗ trợ, xin vui lòng liên hệ với chúng tôi. Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất!</p>
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 10px 20px 30px 20px;">
                              <hr  width="85%" align="center" />
                              <p style="font-size: 14px; font-style: italic; line-height: 20px; color: #4a4848; text-align: center; margin: 0;">
                                  Đây là email được gửi tự động từ hệ thống. <br>Mọi thông tin cần hỗ trợ xin vui lòng liên hệ qua địa chỉ: <span style="color: rgb(64, 64, 225); text-decoration: none;">otlichno.edu@gmail.com</span>
                                  hoặc số điện thoại +79533733420</p>
                          </td>
                      </tr>
                  </table>
              </div>
            </center>
          </body>
          `,
        });
      }

      return {
        status: HttpStatus.CREATED,
        message: 'Thay đổi trạng thái thành công',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async changeInfoByAdmin(updateUserDto: UpdateUserDto, role: number) {
    if (role !== 4) {
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
    if (role !== 4) {
      throw new BadRequestException({
        message: 'Chỉ admin mới xem được khóa người dùng',
      });
    }
    try {
      const user = await this.userModal.findById(id);
      //   from: 'otlichno.edu@gmail.com',
      //   to: user?.email,
      //   subject: 'Tài khoản bị khóa',
      //   html: `
      //   <body style="margin: 0; padding: 0; background-color: #ffffff;">
      //   <center>
      //       <div style="width: 700px; max-height: 600px; background-color: #f6f2f2; padding:10px 0 40px 0;">
      //           <table cellpadding="0" cellspacing="0" width="100%"
      //               style="max-width: 500px; margin-top: 30px; background-color: #f8f8f8; border: 1px solid #c7c3c3;">
      //               <tr>
      //                   <td align="center" style="padding: 10px 0 10px 0; background-color: #ea9e96;">
      //                       <h1 style="font-size: 24px; margin-bottom: 20px;">Tài khoản của bạn bị khóa</h1>
      //                   </td>
      //               </tr>
      //               <tr>
      //                   <td style="padding: 20px 40px;">
      //                       <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Xin chào <strong style="color: rgb(50, 50, 226);">${user?.name}</strong>!</p>
      //                       <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Rất tiếc thông báo rằng tài khoản của bạn đã bị khóa vì bạn đã vi phạm tiêu chuẩn cộng đồng.</p>
      //                       <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Để biết rõ hơn vui lòng truy cập website và mục <strong>Tiêu chuẩn cộng đồng</strong>.</p>
      //                       <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;"></p>

      //                       <br>
      //                       <p style="font-size: 16px; ">Mọi khiếu nại hoặc cần hỗ trợ, xin vui lòng liên hệ với chúng tôi. Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất!</p>
      //                   </td>
      //               </tr>
      //               <tr>
      //                   <td style="padding: 10px 20px 30px 20px;">
      //                       <hr  width="85%" align="center" />
      //                       <p style="font-size: 14px; font-style: italic; line-height: 20px; color: #4a4848; text-align: center; margin: 0;">
      //                           Đây là email được gửi tự động từ hệ thống. <br>Mọi thông tin cần hỗ trợ xin vui lòng liên hệ qua địa chỉ: <span style="color: rgb(64, 64, 225); text-decoration: none;">otlichno.edu@gmail.com</span>
      //                           hoặc số điện thoại +79533733420</p>
      //                   </td>
      //               </tr>
      //           </table>
      //       </div>
      //     </center>
      //   </body>
      //   `,
      // });
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
        message: 'Bạn không phải là admin',
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
