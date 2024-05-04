import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordDto } from './dto/password-dto';
import { ForgotPasswordDto } from './dto/forgot-password-dto';
import { ResetPassordDto } from './dto/reset-password-dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('/')
  findAll(@Req() req) {
    const { status, role } = req.query;
    return this.usersService.findAll(status, role);
  }

  @Get('/approve-teacher/:id')
  approveTeacher(@Req() req, @Param('id') id: string) {
    return this.usersService.approveTeacher(req?.user?.role, id);
  }

  @Get('/reject-teacher/:id')
  rejectTeacher(@Req() req, @Param('id') id: string) {
    return this.usersService.rejectTeacher(req?.user?.role, id);
  }

  @Get('/statis')
  statis(@Req() req) {
    return this.usersService.statis(req?.user?.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('/change-password')
  changePassword(@Body() passwordDto: PasswordDto, @Req() req) {
    return this.usersService.changePassword(passwordDto, req?.user?._id);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.usersService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPassordDto: ResetPassordDto) {
    return await this.usersService.resetPassword(resetPassordDto);
  }

  @Patch('/:id')
  changeInfo(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.changeInfo(updateUserDto, id);
  }

  @Patch('/blockAccount/:id')
  blockAccount(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.blockAccount(updateUserDto, id);
  }

  @Delete('/:id')
  remove(@Param('id') id: string, @Req() req) {
    return this.usersService.remove(id, req?.user?.role);
  }
}
