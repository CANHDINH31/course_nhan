import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Test } from 'src/schemas/tests.schema';
import { Model } from 'mongoose';
import { error } from 'console';

@Injectable()
export class TestsService {
  constructor(@InjectModel(Test.name) private testModal: Model<Test>) {}

  async create(createTestDto: CreateTestDto) {
    try {
      const data = await this.testModal.create(createTestDto);
      return {
        status: HttpStatus.CREATED,
        message: 'ADD NEW TEST SUCCESSFULL',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(lesson: string) {
    const query = {
      ...(lesson && { lesson: lesson }),
    };

    try {
      return await this.testModal
        .find(query)
        .sort({ createdAt: -1 })
        .populate('lesson');
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return this.testModal.findById(id).populate('lesson');
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateTestDto: UpdateTestDto) {
    const data = await this.testModal.findByIdAndUpdate(id, updateTestDto, {
      new: true,
    });

    return {
      status: HttpStatus.CREATED,
      message: 'SUCCESSFULL',
      data,
    };
  }

  async remove(id: string) {
    try {
      await this.testModal.findByIdAndDelete(id);
      return {
        message: 'DELETE SUCCESSFULLY',
      };
    } catch (error) {
      throw error;
    }
  }
}
