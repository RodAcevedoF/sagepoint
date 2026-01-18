import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import {
  ROADMAP_SERVICE,
  type IRoadmapService,
} from '@/features/roadmap/domain/inbound/roadmap.service';

interface GenerateRoadmapDto {
  documentId: string;
  title: string;
}

@Controller('roadmaps')
export class RoadmapController {
  constructor(
    @Inject(ROADMAP_SERVICE)
    private readonly roadmapService: IRoadmapService,
  ) {}

  @Post()
  async generate(@Body() dto: GenerateRoadmapDto) {
    const roadmap = await this.roadmapService.generate(dto);
    return roadmap;
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const roadmap = await this.roadmapService.findById(id);
    if (!roadmap) {
      throw new NotFoundException(`Roadmap ${id} not found`);
    }
    return roadmap;
  }

  @Get('document/:documentId')
  async findByDocumentId(@Param('documentId') documentId: string) {
    return this.roadmapService.findByDocumentId(documentId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.roadmapService.delete(id);
    return { deleted: true };
  }
  @Get('graph/:documentId')
  async getGraph(@Param('documentId') documentId: string) {
    return this.roadmapService.getGraph(documentId);
  }
}
