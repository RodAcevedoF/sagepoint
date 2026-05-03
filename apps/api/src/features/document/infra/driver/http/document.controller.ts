import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Sse,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  DOCUMENT_SERVICE,
  type IDocumentService,
} from '@/features/document/domain/inbound/document.service';
import {
  DOCUMENT_PROGRESS_SERVICE,
  type IDocumentProgressService,
  type SseProgressEvent,
} from '@/features/document/domain/inbound/document-progress.service';
import 'multer';
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import type { RequestUser } from '@/features/auth/domain/request-user';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';
import { GetUserDocumentsDto } from './get-user-documents.dto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(
    @Inject(DOCUMENT_SERVICE)
    private readonly documentService: IDocumentService,
    @Inject(DOCUMENT_PROGRESS_SERVICE)
    private readonly progressService: IDocumentProgressService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: RequestUser,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    return await this.documentService.upload({
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      fileBuffer: file.buffer,
      userId: user.id,
    });
  }

  @Get()
  async list() {
    return await this.documentService.list();
  }

  @Get('user/me')
  async getUserDocuments(
    @CurrentUser() user: RequestUser,
    @Query() query: GetUserDocumentsDto,
  ) {
    return await this.documentService.getUserDocumentsCursor(user.id, {
      limit: query.limit ?? 12,
      cursor: query.cursor,
    });
  }

  @Sse(':id/events')
  events(@Param('id') documentId: string): Observable<SseProgressEvent> {
    return this.progressService.streamProgress(documentId);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const document = await this.documentService.get(id);
    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }
    return document;
  }

  @Get(':id/summary')
  async getSummary(@Param('id') id: string) {
    return await this.documentService.getSummary(id);
  }

  @Get(':id/quizzes')
  async getQuizzes(@Param('id') id: string) {
    return await this.documentService.getQuizzes(id);
  }

  @Get(':id/quizzes/:quizId')
  async getQuizWithQuestions(
    @Param('id') _id: string,
    @Param('quizId') quizId: string,
  ) {
    return await this.documentService.getQuizWithQuestions(quizId);
  }

  @Post(':id/quizzes/:quizId/attempt')
  async submitQuizAttempt(
    @Param('id') _id: string,
    @Param('quizId') quizId: string,
    @CurrentUser() user: RequestUser,
    @Body() body: { answers: Record<string, string> },
  ) {
    return await this.documentService.submitQuizAttempt({
      quizId,
      userId: user.id,
      answers: body.answers,
    });
  }

  @Get(':id/quizzes/:quizId/attempts')
  async getQuizAttempts(
    @Param('id') _id: string,
    @Param('quizId') quizId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return await this.documentService.getQuizAttempts(user.id, quizId);
  }

  @Patch(':id/filename')
  async updateFilename(
    @Param('id') id: string,
    @Body() dto: { filename: string },
    @CurrentUser() user: RequestUser,
  ) {
    return await this.documentService.updateFilename(id, user.id, dto.filename);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    await this.documentService.delete(id, user.id);
    return { success: true };
  }
}
