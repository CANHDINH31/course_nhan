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

      await this.mailerService.sendMail({
        to: registerDto.email,
        subject: 'Register Account Successfully',
        text: `Congratulations, you successfully registered an account. If you are a teacher, please continue to wait for the successful activation email`,
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
      await this.mailerService.sendMail({
        to: registerForChildDto.email,
        subject: 'Register Account Successfully',
        text: `Congratulations, you successfully registered an account`,
      });

      const child = await this.userService.create({
        ...registerForChildDto,
        password,
        status: 1,
        role: 1,
      });

      return await this.userService.changeInfo(
        {
          _id: user?._id,
          phone: user?.phone,
          name: user.name,
          description: user?.description,
          children: [...user.children, child.data._id],
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
