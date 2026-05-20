export type AppTab = 'editor' | 'stats' | 'dashboard' | 'config';

export type ChannelType = 'email' | 'whatsapp' | 'sms' | 'courrier' | 'appel';

export type NodeType = ChannelType | 'start' | 'end';

export type EdgeType = 'escalation' | 'reminder';

export type ExamType =
  | 'Biopsie simple'
  | 'Biopsie étagée'
  | 'Pièce opératoire'
  | 'Cytologie gynécologique'
  | 'Cytologie non gynécologique'
  | 'Cytoponction'
  | 'Examen extemporané'
  | 'Biologie moléculaire'
  | 'Autopsie';

export type DelayDays = 1 | 3 | 7 | 14 | 30;

export interface NodeConfig {
  subject?: string;
  body?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface WorkflowNode {
  id: string;
  workflowId?: string;
  type: NodeType;
  label: string;
  positionX: number;
  positionY: number;
  gridCol: number;
  gridRow: number;
  config: NodeConfig | string;
  createdAt?: string;
}

export interface WorkflowEdge {
  id: string;
  workflowId?: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  delayDays?: number | null;
  createdAt?: string;
}

export interface Workflow {
  id: string;
  name: string;
  examTypes: string[] | string;
  globalTimeout: number;
  createdAt?: string;
  updatedAt?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  _count?: { nodes: number; edges: number };
}

export interface WorkflowSummary {
  id: string;
  name: string;
  examTypes: string[] | string;
  globalTimeout: number;
  createdAt: string;
  updatedAt: string;
  _count?: { nodes: number; edges: number };
}

export interface CreateWorkflowInput {
  name: string;
  examTypes: string[];
}

export interface UpdateWorkflowInput {
  name?: string;
  examTypes?: string[];
  globalTimeout?: number;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
