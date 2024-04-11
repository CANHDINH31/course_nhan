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

  @Get('/my-create-course')
  myCreateCourse(@Req() req) {
    return this.coursesService.myCreateCourse(req?.user);
  }

  @Get('/')
  findAll(@Req() req) {
    const { status } = req.query;
    return this.coursesService.findAll(req?.user?.role, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(+id);
  }
}
