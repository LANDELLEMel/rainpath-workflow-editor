import { z } from 'zod';

export const channelTypeSchema = z.enum([
  'email',
  'whatsapp',
  'sms',
  'courrier',
  'appel',
]);

export const nodeTypeSchema = z.enum([
  'start',
  'email',
  'whatsapp',
  'sms',
  'courrier',
  'appel',
  'end',
]);

export const edgeTypeSchema = z.enum(['escalation', 'reminder']);

export const examTypeSchema = z.enum([
  'Biopsie simple',
  'Biopsie étagée',
  'Pièce opératoire',
  'Cytologie gynécologique',
  'Cytologie non gynécologique',
  'Cytoponction',
  'Examen extemporané',
  'Biologie moléculaire',
  'Autopsie',
]);

export const delayDaysSchema = z.union([
  z.literal(1),
  z.literal(3),
  z.literal(7),
  z.literal(14),
  z.literal(30),
]);

export const nodeConfigSchema = z
  .object({
    subject: z.string().optional(),
    body: z.string().optional(),
    notes: z.string().optional(),
  })
  .passthrough();

export const workflowNodeSchema = z.object({
  id: z.string(),
  workflowId: z.string().optional(),
  type: nodeTypeSchema,
  label: z.string(),
  positionX: z.number(),
  positionY: z.number(),
  gridCol: z.number().int(),
  gridRow: z.number().int(),
  config: z.union([nodeConfigSchema, z.string()]),
  createdAt: z.string().optional(),
});

export const workflowEdgeSchema = z.object({
  id: z.string(),
  workflowId: z.string().optional(),
  sourceId: z.string(),
  targetId: z.string(),
  type: edgeTypeSchema,
  delayDays: z.number().int().nullable().optional(),
  createdAt: z.string().optional(),
});

export const workflowSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  examTypes: z.union([z.array(z.string()), z.string()]),
  globalTimeout: z.number().int(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  nodes: z.array(workflowNodeSchema).optional(),
  edges: z.array(workflowEdgeSchema).optional(),
  _count: z
    .object({ nodes: z.number(), edges: z.number() })
    .optional(),
});

export const workflowSummarySchema = workflowSchema.omit({
  nodes: true,
  edges: true,
});

export const createWorkflowInputSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  examTypes: z.array(z.string()),
});

export const updateWorkflowInputSchema = z.object({
  name: z.string().min(1).optional(),
  examTypes: z.array(z.string()).optional(),
  globalTimeout: z.number().int().optional(),
  nodes: z.array(workflowNodeSchema),
  edges: z.array(workflowEdgeSchema),
});

export type WorkflowSchema = z.infer<typeof workflowSchema>;
export type WorkflowNodeSchema = z.infer<typeof workflowNodeSchema>;
export type WorkflowEdgeSchema = z.infer<typeof workflowEdgeSchema>;
export type CreateWorkflowInputSchema = z.infer<typeof createWorkflowInputSchema>;
export type UpdateWorkflowInputSchema = z.infer<typeof updateWorkflowInputSchema>;
