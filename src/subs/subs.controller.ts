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
import { SubsService } from './subs.service';
import { CreateSubDto } from './dto/create-sub.dto';
import { UpdateSubDto } from './dto/update-sub.dto';

@Controller('subs')
export class SubsController {
  constructor(private readonly subsService: SubsService) {}

  @Post()
  async create(@Body() createSubDto: CreateSubDto) {
    return this.subsService.create(createSubDto);
  }

  @Get()
  findAll(@Req() req) {
    const { parent, student, course } = req.query;
    return this.subsService.findAll(parent, student, course);
  }

  @Get('/top')
  top(@Req() req) {
    return this.subsService.top();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubDto: UpdateSubDto) {
    return this.subsService.update(+id, updateSubDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subsService.remove(+id);
  }
}
