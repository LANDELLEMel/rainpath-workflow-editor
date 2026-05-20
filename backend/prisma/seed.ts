import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

// Grille — doit rester aligné avec frontend/src/utils/gridLayout.ts
const NODE_WIDTH = 200;
const NODE_HEIGHT = 88;
const H_GAP = 120;
const V_GAP = 80;
const COL_STRIDE = NODE_WIDTH + H_GAP; // 320
const ROW_STRIDE = NODE_HEIGHT + V_GAP; // 168

interface SeedNode {
  id: string;
  type: 'start' | 'end' | 'email' | 'sms' | 'whatsapp' | 'courrier' | 'appel';
  label: string;
  col: number;
  row: number;
  config: Record<string, unknown>;
}

interface SeedEdge {
  id: string;
  src: string;
  tgt: string;
  type: 'escalation' | 'reminder';
  delay: number | null;
}

interface SeedWorkflow {
  name: string;
  examTypes: string[];
  globalTimeout: number;
  nodes: SeedNode[];
  edges: SeedEdge[];
}

async function buildWorkflow(wf: SeedWorkflow) {
  const workflow = await prisma.workflow.create({
    data: {
      name: wf.name,
      examTypes: JSON.stringify(wf.examTypes),
      globalTimeout: wf.globalTimeout,
    },
  });

  for (const n of wf.nodes) {
    await prisma.node.create({
      data: {
        id: n.id,
        workflowId: workflow.id,
        type: n.type,
        label: n.label,
        positionX: n.col * COL_STRIDE,
        positionY: n.row * ROW_STRIDE,
        gridCol: n.col,
        gridRow: n.row,
        config: JSON.stringify(n.config),
      },
    });
  }

  for (const e of wf.edges) {
    await prisma.edge.create({
      data: {
        id: e.id,
        workflowId: workflow.id,
        sourceId: e.src,
        targetId: e.tgt,
        type: e.type,
        delayDays: e.delay,
      },
    });
  }

  return { name: workflow.name, nodes: wf.nodes.length, edges: wf.edges.length };
}

// ─────────────────────────────────────────────────────────────────────────
// Workflow 1 — Remise de résultats — Biopsies (Histologie)
// ─────────────────────────────────────────────────────────────────────────
const biopsies: SeedWorkflow = {
  name: 'Remise de résultats — Biopsies',
  examTypes: ['Histologie'],
  globalTimeout: 14,
  nodes: [
    {
      id: 'w1-start',
      type: 'start',
      label: 'Examen effectué',
      col: 0,
      row: 0,
      config: {},
    },
    {
      id: 'w1-email',
      type: 'email',
      label: 'Email de notification',
      col: 1,
      row: 0,
      config: {
        subject: 'Résultat de votre examen — Réf. {ref_examen}',
        body:
          'Bonjour {prenom_patient} {nom_patient},\n\n' +
          'Le résultat de votre examen histologique (réf. {ref_examen}, réalisé le {date_examen}) est désormais disponible au laboratoire {nom_labo}.\n\n' +
          "Nous vous invitons à venir le retirer aux horaires d'ouverture habituels.\n\n" +
          'Bien cordialement,\n{nom_labo}',
      },
    },
    {
      id: 'w1-email-relance',
      type: 'email',
      label: 'Relance email',
      col: 1,
      row: 1,
      config: {
        subject: 'Rappel — Votre résultat reste à retirer (Réf. {ref_examen})',
        body:
          'Bonjour {prenom_patient} {nom_patient},\n\n' +
          "Nous vous rappelons que le résultat de votre examen (réf. {ref_examen} du {date_examen}) est toujours en attente de retrait au laboratoire {nom_labo}.\n\n" +
          'Merci de prendre contact avec nos services dès que possible.\n\n' +
          'Bien cordialement,\n{nom_labo}',
      },
    },
    {
      id: 'w1-sms',
      type: 'sms',
      label: 'SMS de rappel',
      col: 2,
      row: 0,
      config: {
        body:
          '{nom_labo} : votre résultat (réf. {ref_examen}) est disponible. Merci de venir le retirer aux horaires habituels.',
      },
    },
    {
      id: 'w1-sms-relance',
      type: 'sms',
      label: 'Relance SMS',
      col: 2,
      row: 1,
      config: {
        body:
          '{nom_labo} : rappel — votre résultat (réf. {ref_examen}) reste à retirer. Merci de nous contacter rapidement.',
      },
    },
    {
      id: 'w1-whatsapp',
      type: 'whatsapp',
      label: 'Message WhatsApp',
      col: 3,
      row: 0,
      config: {
        body:
          'Bonjour {prenom_patient}, {nom_labo} : votre résultat d\'examen (réf. {ref_examen}) est disponible. Merci de prendre contact pour le retirer.',
      },
    },
    {
      id: 'w1-courrier',
      type: 'courrier',
      label: 'Courrier postal',
      col: 4,
      row: 0,
      config: {
        body:
          'Madame, Monsieur {nom_patient},\n\n' +
          "Le résultat de votre examen histologique (réf. {ref_examen}, effectué le {date_examen}) est disponible depuis plusieurs semaines au laboratoire {nom_labo}.\n\n" +
          'Nous vous prions de bien vouloir prendre contact avec nos services dans les meilleurs délais afin de procéder à son retrait.\n\n' +
          'Bien cordialement,\n{nom_labo}',
      },
    },
    {
      id: 'w1-appel',
      type: 'appel',
      label: 'Appel direct',
      col: 5,
      row: 0,
      config: {
        notes:
          'Appel à passer à {prenom_patient} {nom_patient} concernant le résultat d\'examen (réf. {ref_examen}). Objectif : confirmer le retrait du résultat ou organiser sa transmission.',
      },
    },
    {
      id: 'w1-end',
      type: 'end',
      label: 'Résultat retiré',
      col: 6,
      row: 0,
      config: {},
    },
  ],
  edges: [
    { id: 'w1-e1', src: 'w1-start', tgt: 'w1-email', type: 'escalation', delay: null },
    { id: 'w1-e2', src: 'w1-email', tgt: 'w1-email-relance', type: 'reminder', delay: 5 },
    { id: 'w1-e3', src: 'w1-email', tgt: 'w1-sms', type: 'escalation', delay: null },
    { id: 'w1-e4', src: 'w1-sms', tgt: 'w1-sms-relance', type: 'reminder', delay: 3 },
    { id: 'w1-e5', src: 'w1-sms', tgt: 'w1-whatsapp', type: 'escalation', delay: null },
    { id: 'w1-e6', src: 'w1-whatsapp', tgt: 'w1-courrier', type: 'escalation', delay: null },
    { id: 'w1-e7', src: 'w1-courrier', tgt: 'w1-appel', type: 'escalation', delay: null },
    { id: 'w1-e8', src: 'w1-appel', tgt: 'w1-end', type: 'escalation', delay: null },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// Workflow 2 — Résultats urgents — Extemporanés
// ─────────────────────────────────────────────────────────────────────────
const extempo: SeedWorkflow = {
  name: 'Résultats urgents — Extemporanés',
  examTypes: ['Extemporané'],
  globalTimeout: 3,
  nodes: [
    {
      id: 'w2-start',
      type: 'start',
      label: 'Examen effectué',
      col: 0,
      row: 0,
      config: {},
    },
    {
      id: 'w2-sms',
      type: 'sms',
      label: 'SMS urgent',
      col: 1,
      row: 0,
      config: {
        body:
          '{nom_labo} — URGENT : résultat extemporané (réf. {ref_examen}) disponible. Merci de contacter immédiatement le laboratoire.',
      },
    },
    {
      id: 'w2-appel',
      type: 'appel',
      label: 'Appel immédiat',
      col: 2,
      row: 0,
      config: {
        notes:
          'URGENT — Appel immédiat à passer à {prenom_patient} {nom_patient} pour transmission du résultat extemporané (réf. {ref_examen}).',
      },
    },
    {
      id: 'w2-end',
      type: 'end',
      label: 'Résultat retiré',
      col: 3,
      row: 0,
      config: {},
    },
  ],
  edges: [
    { id: 'w2-e1', src: 'w2-start', tgt: 'w2-sms', type: 'escalation', delay: null },
    { id: 'w2-e2', src: 'w2-sms', tgt: 'w2-appel', type: 'escalation', delay: null },
    { id: 'w2-e3', src: 'w2-appel', tgt: 'w2-end', type: 'escalation', delay: null },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// Workflow 3 — Suivi cytologie courante
// ─────────────────────────────────────────────────────────────────────────
const cytologie: SeedWorkflow = {
  name: 'Suivi cytologie courante',
  examTypes: ['Cytologie'],
  globalTimeout: 10,
  nodes: [
    {
      id: 'w3-start',
      type: 'start',
      label: 'Examen effectué',
      col: 0,
      row: 0,
      config: {},
    },
    {
      id: 'w3-email',
      type: 'email',
      label: 'Email de notification',
      col: 1,
      row: 0,
      config: {
        subject: 'Votre résultat d\'examen cytologique — Réf. {ref_examen}',
        body:
          'Bonjour {prenom_patient} {nom_patient},\n\n' +
          'Votre examen cytologique (réf. {ref_examen}, réalisé le {date_examen}) a été analysé. Les résultats sont à votre disposition au laboratoire {nom_labo}.\n\n' +
          'Nous vous prions de venir les retirer aux horaires habituels.\n\n' +
          'Bien cordialement,\n{nom_labo}',
      },
    },
    {
      id: 'w3-email-relance',
      type: 'email',
      label: 'Relance email',
      col: 1,
      row: 1,
      config: {
        subject: 'Rappel — Résultat cytologique en attente (Réf. {ref_examen})',
        body:
          'Bonjour {prenom_patient} {nom_patient},\n\n' +
          "Nous n'avons pas encore eu de nouvelles de votre part concernant le retrait de votre résultat d'examen cytologique (réf. {ref_examen}).\n\n" +
          'Merci de bien vouloir prendre contact avec le laboratoire {nom_labo}.\n\n' +
          'Bien cordialement,\n{nom_labo}',
      },
    },
    {
      id: 'w3-sms',
      type: 'sms',
      label: 'SMS',
      col: 2,
      row: 0,
      config: {
        body:
          '{nom_labo} : votre résultat cytologique (réf. {ref_examen}) est prêt. Merci de passer le retirer.',
      },
    },
    {
      id: 'w3-courrier',
      type: 'courrier',
      label: 'Courrier postal',
      col: 3,
      row: 0,
      config: {
        body:
          'Madame, Monsieur {nom_patient},\n\n' +
          "Nous nous permettons de vous écrire afin de vous informer que les résultats de votre examen cytologique (réf. {ref_examen}, réalisé le {date_examen}) sont disponibles depuis plusieurs jours au laboratoire {nom_labo}.\n\n" +
          'Nous vous remercions de bien vouloir prendre contact avec nos services.\n\n' +
          'Bien cordialement,\n{nom_labo}',
      },
    },
    {
      id: 'w3-end',
      type: 'end',
      label: 'Résultat retiré',
      col: 4,
      row: 0,
      config: {},
    },
  ],
  edges: [
    { id: 'w3-e1', src: 'w3-start', tgt: 'w3-email', type: 'escalation', delay: null },
    { id: 'w3-e2', src: 'w3-email', tgt: 'w3-email-relance', type: 'reminder', delay: 7 },
    { id: 'w3-e3', src: 'w3-email', tgt: 'w3-sms', type: 'escalation', delay: null },
    { id: 'w3-e4', src: 'w3-sms', tgt: 'w3-courrier', type: 'escalation', delay: null },
    { id: 'w3-e5', src: 'w3-courrier', tgt: 'w3-end', type: 'escalation', delay: null },
  ],
};

// ─────────────────────────────────────────────────────────────────────────
// Workflow 4 — Résultats complémentaires — Biologie moléculaire
// ─────────────────────────────────────────────────────────────────────────
const biomol: SeedWorkflow = {
  name: 'Résultats complémentaires — Biologie moléculaire',
  examTypes: ['Biologie moléculaire'],
  globalTimeout: 21,
  nodes: [
    {
      id: 'w4-start',
      type: 'start',
      label: 'Examen effectué',
      col: 0,
      row: 0,
      config: {},
    },
    {
      id: 'w4-email',
      type: 'email',
      label: 'Email initial',
      col: 1,
      row: 0,
      config: {
        subject: 'Résultats complémentaires d\'analyses — Réf. {ref_examen}',
        body:
          'Bonjour {prenom_patient} {nom_patient},\n\n' +
          'Des analyses complémentaires de biologie moléculaire ont été réalisées sur votre prélèvement (réf. {ref_examen} du {date_examen}).\n\n' +
          'Les résultats sont désormais disponibles au laboratoire {nom_labo}. Nous vous invitons à prendre contact pour en organiser le retrait.\n\n' +
          'Bien cordialement,\n{nom_labo}',
      },
    },
    {
      id: 'w4-email-r1',
      type: 'email',
      label: 'Relance email',
      col: 1,
      row: 1,
      config: {
        subject: 'Rappel — Résultats d\'analyses complémentaires disponibles',
        body:
          'Bonjour {prenom_patient} {nom_patient},\n\n' +
          'Nous vous rappelons que les résultats complémentaires de votre prélèvement (réf. {ref_examen}) sont à votre disposition au laboratoire {nom_labo}.\n\n' +
          'Merci de prendre contact avec nos services.\n\n' +
          'Bien cordialement,\n{nom_labo}',
      },
    },
    {
      id: 'w4-email-r2',
      type: 'email',
      label: 'Relance email (2)',
      col: 1,
      row: 2,
      config: {
        subject: 'Important — Résultats d\'analyses en attente (Réf. {ref_examen})',
        body:
          'Bonjour {prenom_patient} {nom_patient},\n\n' +
          'Vos résultats d\'analyses complémentaires (réf. {ref_examen}) restent en attente de retrait au laboratoire {nom_labo} depuis plusieurs semaines.\n\n' +
          'Il est important que vous preniez connaissance de ces résultats. Merci de bien vouloir nous contacter rapidement.\n\n' +
          'Bien cordialement,\n{nom_labo}',
      },
    },
    {
      id: 'w4-whatsapp',
      type: 'whatsapp',
      label: 'WhatsApp',
      col: 2,
      row: 0,
      config: {
        body:
          'Bonjour {prenom_patient}, {nom_labo} : vos résultats complémentaires d\'analyses (réf. {ref_examen}) sont disponibles. Merci de prendre contact.',
      },
    },
    {
      id: 'w4-whatsapp-r1',
      type: 'whatsapp',
      label: 'Relance WhatsApp',
      col: 2,
      row: 1,
      config: {
        body:
          'Rappel — {nom_labo} : vos résultats complémentaires (réf. {ref_examen}) sont toujours en attente de retrait. Merci de nous contacter.',
      },
    },
    {
      id: 'w4-appel',
      type: 'appel',
      label: 'Appel téléphonique',
      col: 3,
      row: 0,
      config: {
        notes:
          "Appel à passer à {prenom_patient} {nom_patient} pour récupération des résultats complémentaires d'analyses (biologie moléculaire, réf. {ref_examen}). Préciser l'importance de la prise de connaissance.",
      },
    },
    {
      id: 'w4-end',
      type: 'end',
      label: 'Résultat retiré',
      col: 4,
      row: 0,
      config: {},
    },
  ],
  edges: [
    { id: 'w4-e1', src: 'w4-start', tgt: 'w4-email', type: 'escalation', delay: null },
    { id: 'w4-e2', src: 'w4-email', tgt: 'w4-email-r1', type: 'reminder', delay: 7 },
    { id: 'w4-e3', src: 'w4-email-r1', tgt: 'w4-email-r2', type: 'reminder', delay: 14 },
    { id: 'w4-e4', src: 'w4-email', tgt: 'w4-whatsapp', type: 'escalation', delay: null },
    { id: 'w4-e5', src: 'w4-whatsapp', tgt: 'w4-whatsapp-r1', type: 'reminder', delay: 5 },
    { id: 'w4-e6', src: 'w4-whatsapp', tgt: 'w4-appel', type: 'escalation', delay: null },
    { id: 'w4-e7', src: 'w4-appel', tgt: 'w4-end', type: 'escalation', delay: null },
  ],
};

async function main() {
  await prisma.edge.deleteMany();
  await prisma.node.deleteMany();
  await prisma.workflow.deleteMany();

  const results = [];
  for (const wf of [biopsies, extempo, cytologie, biomol]) {
    results.push(await buildWorkflow(wf));
  }

  console.log('✅ Seed complete!');
  for (const r of results) {
    console.log(`   ${r.name} — ${r.nodes} nodes, ${r.edges} edges`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
