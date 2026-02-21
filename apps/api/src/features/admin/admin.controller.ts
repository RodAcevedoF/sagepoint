import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@sagepoint/domain';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';
import { RolesGuard } from '@/features/auth/infra/guards/roles.guard';
import { Roles } from '@/features/auth/decorators/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  async getUsers() {
    return this.adminService.getUsers();
  }
}
