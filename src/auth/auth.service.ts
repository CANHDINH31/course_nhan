import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nest-modules/mailer';
import { RegisterForChildDto } from './dto/register-for-child.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {}

  async register(registerDto: RegisterDto) {
    try {
      const existAccount = await this.userService.findByEmailAndUsername({
        email: registerDto.email,
        username: registerDto.username,
      });
      if (existAccount?.length > 0)
        throw new BadRequestException({
          message: 'Email hoặc Username đã tồn tại',
        });
      const password = await bcrypt.hash(registerDto.password, 10);
      let status;
      if (registerDto.role === 3) {
        status = 0;
      }
      // gửi mail khi đăng ký (chưa phân biệt teacher với student/parent)
      await this.mailerService.sendMail({
        to: registerDto.email,
        subject:
          registerDto.role === 3
            ? 'Đăng ký xác nhận tài khoản'
            : 'Đăng ký tài khoản thành công',
        html:
          registerDto.role === 1 || registerDto.role === 2
            ? `
        <body style="margin: 0; padding: 0; background-color: #ffffff;">
          <center>
                <div style="width: 700px; max-height: 600px; background-color: #f6f2f2; padding:10px 0 40px 0;">
                    <table cellpadding="0" cellspacing="0" width="100%"
                        style="max-width: 500px; margin-top: 30px; background-color: #f8f8f8; border: 1px solid #c7c3c3;">
                        <tr>
                            <td align="center" style="padding: 10px 0 10px 0; background-color: #aad58a;">
                                <h1 style="font-size: 24px; margin-bottom: 20px;">Đăng ký tài khoản thành công</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 40px;">
                                <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Xin chào <strong style="color: rgb(50, 50, 226);">${registerDto.name}</strong>!</p>
                                <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Chúc mừng bạn đã đăng ký thành công tài khoản.</p>
                                <!-- <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">If you are a teacher, please continue to wait for the successful activation email.</p> -->
                                <br>
                                <p style="font-size: 16px; ">Cảm ơn bạn đã sử dụng dịch vụ của <strong>Otlichno Education!</strong></p>
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
        `
            : `
        <body style="margin: 0; padding: 0; background-color: #ffffff;">
            <center>
                <div style="width: 700px; max-height: 600px; background-color: #f6f2f2; padding:10px 0 40px 0;">
                    <table cellpadding="0" cellspacing="0" width="100%"
                        style="max-width: 500px; margin-top: 30px; background-color: #f8f8f8; border: 1px solid #c7c3c3;">
                        <tr>
                            <td align="center" style="padding: 10px 0 10px 0; background-color: #aad58a;">
                                <h1 style="font-size: 24px; margin-bottom: 20px;">Đăng ký xác nhận tài khoản</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px 40px;">
                                <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Xin chào <strong style="color: rgb(50, 50, 226);">${registerDto.name}</strong>!</p>
                                <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Bạn đã đăng ký xác nhận tài khoản với vai trò giáo viên thành công.</p>
                                <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Xin vui lòng chờ xác nhận từ Admin về chứng chỉ của bạn. Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất!</p>
                                
                                <br>
                                <p style="font-size: 16px; ">Cảm ơn bạn đã sử dụng dịch vụ của <strong>Otlichno Education!</strong></p>
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

      return await this.userService.create({
        ...registerDto,
        password,
        status,
      });
    } catch (error) {
      throw error;
    }
  }

  async registerForChild(user: any, registerForChildDto: RegisterForChildDto) {
    try {
      if (user.role !== 2) {
        throw new BadRequestException({
          message: 'You are not parent role',
        });
      }
      const existAccount = await this.userService.findByEmailAndUsername({
        email: registerForChildDto.email,
        username: registerForChildDto.username,
      });
      if (existAccount?.length > 0)
        throw new BadRequestException({
          message: 'Email hoặc Username đã tồn tại',
        });
      const password = await bcrypt.hash(registerForChildDto.password, 10);

      // gửi mail khi đăng ký cho con (gửi vào mail con)
      await this.mailerService.sendMail({
        to: registerForChildDto.email,
        subject: 'Đăng ký tài khoản thành công',
        html: `
        <body style="margin: 0; padding: 0; background-color: #ffffff;">
          <center>
              <div style="width: 700px; max-height: 600px; background-color: #f6f2f2; padding:10px 0 40px 0;">
                  <table cellpadding="0" cellspacing="0" width="100%"
                      style="max-width: 500px; margin-top: 30px; background-color: #f8f8f8; border: 1px solid #c7c3c3;">
                      <tr>
                          <td align="center" style="padding: 10px 0 10px 0; background-color: #aad58a;">
                              <h1 style="font-size: 24px; margin-bottom: 20px;">Đăng ký tài khoản thành công</h1>
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 20px 40px;">
                              <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Xin chào <strong style="color: rgb(50, 50, 226);">${registerForChildDto.name}</strong>!</p>
                              <p style="font-size: 18px; line-height: 24px; margin-bottom: 20px;">Bạn đã được phụ huynh ${user.name} đăng ký tài khoản thành công.</p>
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

      const child = await this.userService.create({
        ...registerForChildDto,
        password,
        status: 1,
        role: 1,
      });

      const detailUser: any = await this.userService.findOne(user._id);

      return await this.userService.changeInfo(
        {
          _id: user?._id,
          phone: user?.phone,
          name: user.name,
          description: user?.description,
          children: [...detailUser.children, child.data._id],
        },
        user._id,
      );
    } catch (error) {
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const existAccount = await this.userService.findByUsername(
        loginDto.username,
      );
      if (!existAccount)
        throw new BadRequestException({ message: 'Username is not found' });

      // Check Password
      const isCorrectPassword = await bcrypt.compare(
        loginDto.password,
        existAccount.password,
      );
      if (!isCorrectPassword)
        throw new BadRequestException({ message: 'Password is not correct' });

      if (existAccount.enable === 0) {
        throw new BadRequestException({
          message: 'Your account is disable',
        });
      }

      if (existAccount.status === 0) {
        throw new BadRequestException({
          message: 'Your account is not approve',
        });
      }

      const { password, ...data } = existAccount.toObject();

      const accessToken = await this.jwtService.signAsync(data, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('EXPIRESIN_TOKEN'),
      });

      return {
        status: HttpStatus.OK,
        message: 'Đăng nhập thành công',
        data: { ...data, accessToken },
      };
    } catch (error) {
      throw error;
    }
  }
}
