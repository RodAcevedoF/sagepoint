import {
  Controller,
  Get,
  Post,
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
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import { CreateInvitationUseCase } from './app/usecases/create-invitation.usecase';
import { FindAllInvitationsUseCase } from './app/usecases/find-all-invitations.usecase';
import { RevokeInvitationUseCase } from './app/usecases/revoke-invitation.usecase';
import { ValidateInvitationTokenUseCase } from './app/usecases/validate-invitation-token.usecase';
import { CreateUserDirectUseCase } from './app/usecases/create-user-direct.usecase';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { CreateUserDirectDto } from './dto/create-user-direct.dto';

@Controller('invitations')
export class InvitationController {
  constructor(
    private readonly createInvitation: CreateInvitationUseCase,
    private readonly findAllInvitations: FindAllInvitationsUseCase,
    private readonly revokeInvitation: RevokeInvitationUseCase,
    private readonly validateInvitationToken: ValidateInvitationTokenUseCase,
    private readonly createUserDirect: CreateUserDirectUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(
    @Body() dto: CreateInvitationDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.createInvitation.execute(dto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    return this.findAllInvitations.execute();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async revoke(@Param('id') id: string) {
    return this.revokeInvitation.execute(id);
  }

  @Post('direct')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async direct(@Body() dto: CreateUserDirectDto) {
    return this.createUserDirect.execute(dto);
  }

  @Get('validate')
  async validate(@Query('token') token: string) {
    return this.validateInvitationToken.execute(token);
  }
}
