import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto';

@Controller('api/workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  /** GET /api/workflows — Liste tous les workflows (résumé). */
  @Get()
  findAll() {
    return this.workflowsService.findAll();
  }

  /** GET /api/workflows/:id — Récupère un workflow complet. */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workflowsService.findOne(id);
  }

  /** POST /api/workflows — Crée un nouveau workflow. */
  @Post()
  create(@Body() dto: CreateWorkflowDto) {
    return this.workflowsService.create(dto);
  }

  /** PUT /api/workflows/:id — Met à jour un workflow. */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    return this.workflowsService.update(id, dto);
  }

  /** DELETE /api/workflows/:id — Supprime un workflow. */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }
}
