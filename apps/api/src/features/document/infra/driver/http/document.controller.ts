import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  DOCUMENT_SERVICE,
  type IDocumentService,
} from '@/features/document/domain/inbound/document.service';
import type { Express } from 'express';
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import { User } from '@sagepoint/domain';

import { JwtAuthGuard } from '@/features/auth/guards/jwt-auth.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(
    @Inject(DOCUMENT_SERVICE)
    private readonly documentService: IDocumentService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
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

  @Get(':id')
  async get(@Param('id') id: string) {
    const document = await this.documentService.get(id);
    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }
    return document;
  }
}
