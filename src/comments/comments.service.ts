import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from 'src/schemas/comments.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModal: Model<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    try {
      const data = await this.commentModal.create(createCommentDto);

      return {
        status: HttpStatus.CREATED,
        message: 'ADD NEW COMMENT SUCCESSFULL',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAll(replyComment: string, user: string, lesson: string) {
    try {
      const query = {
        ...(replyComment && { replyComment: replyComment }),
        ...(user && { user: user }),
        ...(lesson && { lesson: lesson }),
      };

      return await this.commentModal
        .find(query)
        .sort({ createdAt: 1 })
        .populate('replyComment')
        .populate('user')
        .populate('lesson');
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      return await this.commentModal
        .findById(id)
        .populate('replyComment')
        .populate('user')
        .populate('lesson');
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateCommentDto: UpdateCommentDto) {
    try {
      const data = await this.commentModal.findByIdAndUpdate(
        id,
        updateCommentDto,
        { new: true },
      );

      return {
        status: HttpStatus.CREATED,
        message: 'SUCCESSFULL',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.commentModal.deleteMany({ replyComment: id });
      await this.commentModal.findByIdAndDelete(id);

      return 'delete comment successfully';
    } catch (error) {
      throw error;
    }
  }
}
