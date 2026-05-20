import type { ChannelType, ExamType } from './workflow';

export type PatientStatus =
  | 'en_attente'
  | 'relance_1'
  | 'relance_2'
  | 'relance_3'
  | 'recupere'
  | 'expire';

export type PatientUrgence = 'normal' | 'urgent' | 'critique';

export interface Patient {
  id: string;
  nom: string;
  prenom?: string;
  examType: ExamType;
  dateExamen: string;
  dateDerniereRelance?: string;
  canal: ChannelType;
  status: PatientStatus;
  jours: number;
  urgence: PatientUrgence;
}

export interface KanbanColumn {
  id: PatientStatus;
  title: string;
  color: string;
  patients: Patient[];
}
