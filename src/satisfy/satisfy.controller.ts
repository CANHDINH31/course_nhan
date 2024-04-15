import { Controller, Get, Param } from '@nestjs/common';
import { SatisfyService } from './satisfy.service';

@Controller('satisfy')
export class SatisfyController {
  constructor(private readonly satisfyService: SatisfyService) {}

  @Get('/student/:id')
  satifyStudent(@Param('id') id: string) {
    return this.satisfyService.satifyStudent(id);
  }

  @Get('/parent/:id')
  satifyParent(@Param('id') id: string) {
    return this.satisfyService.satifyParent(id);
  }

  @Get('/teacher/:id')
  satifyTeacher(@Param('id') id: string) {
    return this.satisfyService.satifyTeacher(id);
  }

  @Get('/admin')
  satifyAdmin() {
    return this.satisfyService.satifyAdmin();
  }
}
