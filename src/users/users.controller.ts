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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('/')
  findAll(@Req() req) {
    const { status } = req.query;
    return this.usersService.findAll(req?.user?.role, status);
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

  @Patch('/:id')
  changeInfo(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.changeInfo(updateUserDto, id);
  }

  @Delete('/:id')
  remove(@Param('id') id: string, @Req() req) {
    return this.usersService.remove(id, req?.user?.role);
  }
}
