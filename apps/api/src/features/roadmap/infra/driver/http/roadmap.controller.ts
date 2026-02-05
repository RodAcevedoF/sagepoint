import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Inject,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/features/auth/infra/guards/jwt-auth.guard';
import { CurrentUser } from '@/features/auth/decorators/current-user.decorator';
import type { RequestUser } from '@sagepoint/domain';
import { StepStatus } from '@sagepoint/domain';
import {
  ROADMAP_SERVICE,
  type IRoadmapService,
} from '@/features/roadmap/domain/inbound/roadmap.service';

interface GenerateRoadmapDto {
  documentId: string;
  title: string;
}

interface UpdateStepProgressDto {
  status: StepStatus;
}

interface RefreshResourcesDto {
  conceptIds?: string[];
}

@Controller('roadmaps')
export class RoadmapController {
  constructor(
    @Inject(ROADMAP_SERVICE)
    private readonly roadmapService: IRoadmapService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async generate(@Body() dto: GenerateRoadmapDto, @CurrentUser() user: RequestUser) {
    const roadmap = await this.roadmapService.generate({
      ...dto,
      userId: user.id,
    });
    return roadmap;
  }

  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  async getUserRoadmaps(@CurrentUser() user: RequestUser) {
    return this.roadmapService.getUserRoadmaps(user.id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const roadmap = await this.roadmapService.findById(id);
    if (!roadmap) {
      throw new NotFoundException(`Roadmap ${id} not found`);
    }
    return roadmap;
  }

  @Get(':id/with-progress')
  @UseGuards(JwtAuthGuard)
  async findByIdWithProgress(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    const result = await this.roadmapService.getUserRoadmapById(user.id, id);
    if (!result) {
      throw new NotFoundException(`Roadmap ${id} not found`);
    }
    return result;
  }

  @Get(':id/resources')
  async getResources(@Param('id') id: string) {
    return this.roadmapService.getResourcesByRoadmap(id);
  }

  @Get('document/:documentId')
  async findByDocumentId(@Param('documentId') documentId: string) {
    return this.roadmapService.findByDocumentId(documentId);
  }

  @Patch(':id/steps/:conceptId/progress')
  @UseGuards(JwtAuthGuard)
  async updateStepProgress(
    @Param('id') roadmapId: string,
    @Param('conceptId') conceptId: string,
    @Body() dto: UpdateStepProgressDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.roadmapService.updateStepProgress({
      userId: user.id,
      roadmapId,
      conceptId,
      status: dto.status,
    });
  }

  @Post(':id/refresh-resources')
  @UseGuards(JwtAuthGuard)
  async refreshResources(
    @Param('id') roadmapId: string,
    @Body() dto: RefreshResourcesDto,
  ) {
    return this.roadmapService.refreshResources({
      roadmapId,
      conceptIds: dto.conceptIds,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    await this.roadmapService.delete(id);
    return { deleted: true };
  }

  @Get('graph/:documentId')
  async getGraph(@Param('documentId') documentId: string) {
    return this.roadmapService.getGraph(documentId);
  }
}
