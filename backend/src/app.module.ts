import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { WorkflowsModule } from './workflows/workflows.module';

@Module({
  imports: [PrismaModule, WorkflowsModule],
})
export class AppModule {}
