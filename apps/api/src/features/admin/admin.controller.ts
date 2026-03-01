import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@sagepoint/domain';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';
import { RolesGuard } from '@/features/auth/infra/guards/roles.guard';
import { Roles } from '@/features/auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import {
  UpdateAdminUserDto,
  GetAdminRoadmapsDto,
  GetAdminDocumentsDto,
  GetAnalyticsDto,
} from './dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('queue-stats')
  async getQueueStats() {
    return this.adminService.getQueueStats();
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateAdminUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Get('roadmaps')
  async getRoadmaps(@Query() dto: GetAdminRoadmapsDto) {
    return this.adminService.getRoadmaps(dto);
  }

  @Delete('roadmaps/:id')
  async deleteRoadmap(@Param('id') id: string) {
    return this.adminService.deleteRoadmap(id);
  }

  @Patch('roadmaps/:id')
  async toggleRoadmapFeatured(@Param('id') id: string) {
    return this.adminService.toggleRoadmapFeatured(id);
  }

  @Get('documents')
  async getDocuments(@Query() dto: GetAdminDocumentsDto) {
    return this.adminService.getDocuments(dto);
  }

  @Delete('documents/:id')
  async deleteDocument(@Param('id') id: string) {
    return this.adminService.deleteDocument(id);
  }

  @Get('analytics')
  async getAnalytics(@Query() dto: GetAnalyticsDto) {
    return this.adminService.getAnalytics(dto.days ?? 30);
  }
}
