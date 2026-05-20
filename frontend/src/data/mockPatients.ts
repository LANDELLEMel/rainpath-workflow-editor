import type {
  KanbanColumn,
  Patient,
  PatientStatus,
  PatientUrgence,
} from '../types/dashboard';

// Référence : la date courante du seed/dev est en mai 2026.
// Les dates d'examen sont calculées par rapport au 20 mai 2026.
const TODAY = new Date('2026-05-20T08:00:00Z');

function isoDaysAgo(days: number): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function urgenceFor(jours: number): PatientUrgence {
  if (jours < 10) return 'normal';
  if (jours <= 20) return 'urgent';
  return 'critique';
}

// 30 patients fictifs, noms français variés, jamais Dupont/Durand.
// L'ordre suit la répartition demandée : 8 / 7 / 5 / 3 / 5 / 2.
interface SeedPatient {
  id: string;
  nom: string;
  examType: Patient['examType'];
  canal: Patient['canal'];
  jours: number;
  status: PatientStatus;
  dateDerniereRelanceDaysAgo?: number;
}

const SEEDS: SeedPatient[] = [
  // en_attente (8) — jours faibles, pas encore relancés
  { id: 'p1', nom: 'Bernard M.', examType: 'Biopsie simple', canal: 'email', jours: 2, status: 'en_attente' },
  { id: 'p2', nom: 'Lefèvre A.', examType: 'Cytologie gynécologique', canal: 'email', jours: 3, status: 'en_attente' },
  { id: 'p3', nom: 'Mercier C.', examType: 'Biopsie étagée', canal: 'sms', jours: 1, status: 'en_attente' },
  { id: 'p4', nom: 'Garnier É.', examType: 'Pièce opératoire', canal: 'email', jours: 4, status: 'en_attente' },
  { id: 'p5', nom: 'Roussel B.', examType: 'Cytoponction', canal: 'sms', jours: 2, status: 'en_attente' },
  { id: 'p6', nom: 'Caron P.', examType: 'Cytologie non gynécologique', canal: 'email', jours: 5, status: 'en_attente' },
  { id: 'p7', nom: 'Aubry L.', examType: 'Biopsie simple', canal: 'email', jours: 3, status: 'en_attente' },
  { id: 'p8', nom: 'Dubreuil V.', examType: 'Biologie moléculaire', canal: 'email', jours: 6, status: 'en_attente' },

  // relance_1 (7) — 1ère relance envoyée
  { id: 'p9', nom: 'Marchand J.', examType: 'Biopsie simple', canal: 'email', jours: 8, status: 'relance_1', dateDerniereRelanceDaysAgo: 2 },
  { id: 'p10', nom: 'Brunel S.', examType: 'Cytologie gynécologique', canal: 'sms', jours: 9, status: 'relance_1', dateDerniereRelanceDaysAgo: 1 },
  { id: 'p11', nom: 'Faure N.', examType: 'Pièce opératoire', canal: 'email', jours: 10, status: 'relance_1', dateDerniereRelanceDaysAgo: 3 },
  { id: 'p12', nom: 'Renaud T.', examType: 'Cytoponction', canal: 'email', jours: 7, status: 'relance_1', dateDerniereRelanceDaysAgo: 1 },
  { id: 'p13', nom: 'Bouchard H.', examType: 'Biopsie étagée', canal: 'sms', jours: 11, status: 'relance_1', dateDerniereRelanceDaysAgo: 2 },
  { id: 'p14', nom: 'Lambert C.', examType: 'Cytologie non gynécologique', canal: 'email', jours: 9, status: 'relance_1', dateDerniereRelanceDaysAgo: 2 },
  { id: 'p15', nom: 'Pelletier I.', examType: 'Biopsie simple', canal: 'sms', jours: 8, status: 'relance_1', dateDerniereRelanceDaysAgo: 1 },

  // relance_2 (5) — 2e relance, urgence montante
  { id: 'p16', nom: 'Chevalier R.', examType: 'Pièce opératoire', canal: 'whatsapp', jours: 14, status: 'relance_2', dateDerniereRelanceDaysAgo: 2 },
  { id: 'p17', nom: 'Sébastien K.', examType: 'Biopsie étagée', canal: 'whatsapp', jours: 16, status: 'relance_2', dateDerniereRelanceDaysAgo: 3 },
  { id: 'p18', nom: 'Charpentier A.', examType: 'Cytologie gynécologique', canal: 'sms', jours: 13, status: 'relance_2', dateDerniereRelanceDaysAgo: 2 },
  { id: 'p19', nom: 'Joly M.', examType: 'Biologie moléculaire', canal: 'whatsapp', jours: 17, status: 'relance_2', dateDerniereRelanceDaysAgo: 1 },
  { id: 'p20', nom: 'Berger E.', examType: 'Biopsie simple', canal: 'whatsapp', jours: 15, status: 'relance_2', dateDerniereRelanceDaysAgo: 2 },

  // relance_3 (3) — dernière chance avant courrier/appel
  { id: 'p21', nom: 'Tessier O.', examType: 'Pièce opératoire', canal: 'appel', jours: 19, status: 'relance_3', dateDerniereRelanceDaysAgo: 3 },
  { id: 'p22', nom: 'Vallet G.', examType: 'Biologie moléculaire', canal: 'courrier', jours: 20, status: 'relance_3', dateDerniereRelanceDaysAgo: 4 },
  { id: 'p23', nom: 'Lemoine D.', examType: 'Biopsie étagée', canal: 'appel', jours: 18, status: 'relance_3', dateDerniereRelanceDaysAgo: 2 },

  // recupere (5) — résultats retirés
  { id: 'p24', nom: 'Rolland F.', examType: 'Cytologie gynécologique', canal: 'email', jours: 6, status: 'recupere', dateDerniereRelanceDaysAgo: 2 },
  { id: 'p25', nom: 'Henry P.', examType: 'Biopsie simple', canal: 'sms', jours: 9, status: 'recupere', dateDerniereRelanceDaysAgo: 5 },
  { id: 'p26', nom: 'Maillard S.', examType: 'Examen extemporané', canal: 'appel', jours: 2, status: 'recupere', dateDerniereRelanceDaysAgo: 1 },
  { id: 'p27', nom: 'Picard E.', examType: 'Pièce opératoire', canal: 'whatsapp', jours: 12, status: 'recupere', dateDerniereRelanceDaysAgo: 6 },
  { id: 'p28', nom: 'Royer M.', examType: 'Cytoponction', canal: 'sms', jours: 5, status: 'recupere', dateDerniereRelanceDaysAgo: 2 },

  // expire (2) — dossiers fermés sans retrait
  { id: 'p29', nom: 'Carpentier T.', examType: 'Biologie moléculaire', canal: 'courrier', jours: 28, status: 'expire', dateDerniereRelanceDaysAgo: 7 },
  { id: 'p30', nom: 'Aubert J.', examType: 'Autopsie', canal: 'courrier', jours: 30, status: 'expire', dateDerniereRelanceDaysAgo: 9 },
];

export const ALL_PATIENTS: Patient[] = SEEDS.map((s) => ({
  id: s.id,
  nom: s.nom,
  examType: s.examType,
  canal: s.canal,
  status: s.status,
  jours: s.jours,
  urgence: urgenceFor(s.jours),
  dateExamen: isoDaysAgo(s.jours),
  dateDerniereRelance:
    s.dateDerniereRelanceDaysAgo !== undefined
      ? isoDaysAgo(s.dateDerniereRelanceDaysAgo)
      : undefined,
}));

const COLUMN_META: ReadonlyArray<{
  id: PatientStatus;
  title: string;
  color: string;
}> = [
  { id: 'en_attente', title: 'En attente', color: '#F59E0B' },
  { id: 'relance_1', title: 'Relance 1', color: '#3B82F6' },
  { id: 'relance_2', title: 'Relance 2', color: '#8B5CF6' },
  { id: 'relance_3', title: 'Relance 3', color: '#EC4899' },
  { id: 'recupere', title: 'Récupéré', color: '#10B981' },
  { id: 'expire', title: 'Expiré', color: '#EF4444' },
];

export const STATUS_LABEL: Record<PatientStatus, string> =
  COLUMN_META.reduce(
    (acc, c) => {
      acc[c.id] = c.title;
      return acc;
    },
    {} as Record<PatientStatus, string>,
  );

export const STATUS_COLOR: Record<PatientStatus, string> =
  COLUMN_META.reduce(
    (acc, c) => {
      acc[c.id] = c.color;
      return acc;
    },
    {} as Record<PatientStatus, string>,
  );

/** Renvoie une copie fraîche du Kanban initial — sans muter SEEDS. */
export function buildInitialColumns(): KanbanColumn[] {
  return COLUMN_META.map((meta) => ({
    id: meta.id,
    title: meta.title,
    color: meta.color,
    patients: ALL_PATIENTS.filter((p) => p.status === meta.id).map((p) => ({
      ...p,
    })),
  }));
}

export const ALL_STATUSES: PatientStatus[] = COLUMN_META.map((c) => c.id);
