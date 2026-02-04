import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Body,
  Inject,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import type { RequestUser } from '@/features/auth/domain/request-user';
import { STORAGE_SERVICE } from '@/features/storage/domain/inbound/storage.service';
import type {
  IStorageService,
  FileCategory,
} from '@/features/storage/domain/inbound/storage.service';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category: FileCategory,
    @Body('isPublic') isPublic: string,
    @CurrentUser() user: RequestUser,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!category) {
      throw new BadRequestException('Category is required');
    }

    const result = await this.storageService.upload({
      content: file.buffer,
      filename: file.originalname,
      mimeType: file.mimetype,
      category,
      userId: user.id,
      isPublic: isPublic === 'true',
    });

    return result;
  }

  @Get('url/*path')
  async getUrl(
    @Param('path') path: string,
    @Query('expires') expires?: string,
  ) {
    const expiresInSeconds = expires ? parseInt(expires, 10) : 3600;
    const url = await this.storageService.getUrl(path, expiresInSeconds);
    return { url };
  }

  @Delete('*path')
  async delete(@Param('path') path: string) {
    await this.storageService.delete(path);
    return { success: true };
  }
}
