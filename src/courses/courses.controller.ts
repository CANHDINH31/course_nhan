import { title } from 'process';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Req() req, @Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto, req?.user);
  }

  @Get('/')
  findAll(@Req() req) {
    const {
      status,
      teacher,
      approve,
      title,
      rank,
      class: className,
      subject,
    } = req.query;

    return this.coursesService.findAll(
      status,
      teacher,
      approve,
      title,
      rank,
      className,
      subject,
    );
  }

  @Get('/new')
  new(@Req() req) {
    return this.coursesService.new();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(+id);
  }
}
