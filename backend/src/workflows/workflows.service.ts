import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Liste tous les workflows (résumé, sans nodes/edges). */
  async findAll() {
    return this.prisma.workflow.findMany({
      select: {
        id: true,
        name: true,
        examTypes: true,
        globalTimeout: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { nodes: true, edges: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /** Récupère un workflow complet avec ses nodes et edges. */
  async findOne(id: string) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        nodes: { orderBy: [{ gridCol: 'asc' }, { gridRow: 'asc' }] },
        edges: true,
      },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }

    return workflow;
  }

  /** Crée un nouveau workflow avec un nœud Start pré-placé. */
  async create(dto: CreateWorkflowDto) {
    return this.prisma.workflow.create({
      data: {
        name: dto.name,
        examTypes: JSON.stringify(dto.examTypes),
        nodes: {
          create: {
            type: 'start',
            label: 'Examen effectué',
            positionX: 0,
            positionY: 0,
            gridCol: 0,
            gridRow: 0,
            config: '{}',
          },
        },
      },
      include: {
        nodes: true,
        edges: true,
      },
    });
  }

  /**
   * Met à jour un workflow : métadonnées et/ou nodes+edges.
   * Stratégie : delete-and-recreate pour nodes et edges (simple et fiable).
   */
  async update(id: string, dto: UpdateWorkflowDto) {
    // Vérifier que le workflow existe
    const existing = await this.prisma.workflow.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Mettre à jour les métadonnées du workflow
      const workflowData: Record<string, unknown> = {};
      if (dto.name !== undefined) workflowData.name = dto.name;
      if (dto.examTypes !== undefined)
        workflowData.examTypes = JSON.stringify(dto.examTypes);
      if (dto.globalTimeout !== undefined)
        workflowData.globalTimeout = dto.globalTimeout;

      if (Object.keys(workflowData).length > 0) {
        await tx.workflow.update({
          where: { id },
          data: workflowData,
        });
      }

      // 2. Si nodes fournis, delete-and-recreate
      if (dto.nodes !== undefined) {
        // D'abord supprimer les edges (FK vers nodes)
        await tx.edge.deleteMany({ where: { workflowId: id } });
        // Puis supprimer les nodes
        await tx.node.deleteMany({ where: { workflowId: id } });

        // Recréer les nodes
        if (dto.nodes.length > 0) {
          await tx.node.createMany({
            data: dto.nodes.map((n) => ({
              id: n.id,
              workflowId: id,
              type: n.type,
              label: n.label,
              positionX: n.positionX,
              positionY: n.positionY,
              gridCol: n.gridCol,
              gridRow: n.gridRow,
              config: n.config ? JSON.stringify(n.config) : '{}',
            })),
          });
        }

        // Recréer les edges
        if (dto.edges && dto.edges.length > 0) {
          await tx.edge.createMany({
            data: dto.edges.map((e) => ({
              id: e.id,
              workflowId: id,
              sourceId: e.sourceId,
              targetId: e.targetId,
              type: e.type,
              delayDays: e.delayDays ?? null,
            })),
          });
        }
      }

      // 3. Retourner le workflow complet mis à jour
      return tx.workflow.findUnique({
        where: { id },
        include: {
          nodes: { orderBy: [{ gridCol: 'asc' }, { gridRow: 'asc' }] },
          edges: true,
        },
      });
    });
  }

  /** Supprime un workflow et ses nodes/edges (cascade). */
  async remove(id: string) {
    const existing = await this.prisma.workflow.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }

    await this.prisma.workflow.delete({ where: { id } });
    return { deleted: true };
  }
}
