// Données fictives pour la page Statistiques.
// Aucune donnée réelle patient — purement de démonstration.

export interface ChannelRate {
  channel: string;
  rate: number;
  color: string;
}

export interface DelayPoint {
  month: string;
  days: number;
}

export interface StatusSlice {
  status: string;
  count: number;
  color: string;
}

export interface WeeklyReminderRow {
  week: string;
  email: number;
  sms: number;
  whatsapp: number;
  appel: number;
  courrier: number;
}

export interface ExamRetrievalRow {
  exam: string;
  rate: number;
}

// Taux de réponse par canal (bar chart horizontal)
export const responseRateByChannel: ChannelRate[] = [
  { channel: 'Email', rate: 62, color: '#007AFF' },
  { channel: 'SMS', rate: 78, color: '#34C759' },
  { channel: 'WhatsApp', rate: 85, color: '#25D366' },
  { channel: 'Appel', rate: 91, color: '#5856D6' },
  { channel: 'Courrier', rate: 34, color: '#003DA5' },
];

// Évolution du délai moyen de récupération (line chart, 6 derniers mois)
export const avgRetrievalDelayTrend: DelayPoint[] = [
  { month: 'Déc', days: 18.2 },
  { month: 'Jan', days: 16.5 },
  { month: 'Fév', days: 15.1 },
  { month: 'Mar', days: 13.8 },
  { month: 'Avr', days: 12.4 },
  { month: 'Mai', days: 11.1 },
];

// Répartition des statuts de résultats (pie/donut chart)
export const resultStatusDistribution: StatusSlice[] = [
  { status: 'Récupérés', count: 847, color: '#10B981' },
  { status: 'En attente', count: 156, color: '#F59E0B' },
  { status: 'Relance en cours', count: 89, color: '#3B82F6' },
  { status: 'Expirés', count: 23, color: '#EF4444' },
];

// Volume de relances par semaine (bar chart vertical stacked, 8 dernières semaines)
export const weeklyReminderVolume: WeeklyReminderRow[] = [
  { week: 'S14', email: 45, sms: 22, whatsapp: 18, appel: 8, courrier: 3 },
  { week: 'S15', email: 52, sms: 28, whatsapp: 21, appel: 12, courrier: 2 },
  { week: 'S16', email: 38, sms: 19, whatsapp: 15, appel: 6, courrier: 4 },
  { week: 'S17', email: 61, sms: 31, whatsapp: 24, appel: 10, courrier: 3 },
  { week: 'S18', email: 48, sms: 25, whatsapp: 20, appel: 9, courrier: 2 },
  { week: 'S19', email: 55, sms: 29, whatsapp: 23, appel: 11, courrier: 5 },
  { week: 'S20', email: 42, sms: 20, whatsapp: 17, appel: 7, courrier: 1 },
  { week: 'S21', email: 58, sms: 32, whatsapp: 26, appel: 13, courrier: 4 },
];

export interface Kpis {
  totalPatients: number;
  retrievalRate: number;
  avgDelay: number;
  activeReminders: number;
  overdueCount: number;
}

export const kpis: Kpis = {
  totalPatients: 1115,
  retrievalRate: 75.9,
  avgDelay: 11.1,
  activeReminders: 245,
  overdueCount: 23,
};

// Taux de récupération par type d'examen (horizontal bar)
export const retrievalByExamType: ExamRetrievalRow[] = [
  { exam: 'Biopsie simple', rate: 82 },
  { exam: 'Biopsie étagée', rate: 76 },
  { exam: 'Pièce opératoire', rate: 71 },
  { exam: 'Cytologie gynéco.', rate: 88 },
  { exam: 'Cytologie non gynéco.', rate: 79 },
  { exam: 'Cytoponction', rate: 73 },
  { exam: 'Examen extemporané', rate: 95 },
  { exam: 'Biologie moléculaire', rate: 64 },
  { exam: 'Autopsie', rate: 58 },
];
