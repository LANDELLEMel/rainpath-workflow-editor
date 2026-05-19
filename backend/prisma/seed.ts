import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

const NODE_WIDTH = 200;
const NODE_HEIGHT = 88;
const H_GAP = 120;
const V_GAP = 80;
const COL_STRIDE = NODE_WIDTH + H_GAP; // 320
const ROW_STRIDE = NODE_HEIGHT + V_GAP; // 168

function pos(col: number, row: number) {
  return { x: col * COL_STRIDE, y: row * ROW_STRIDE };
}

async function buildHistologieWorkflow() {
  const workflow = await prisma.workflow.create({
    data: {
      name: 'Relance résultats — Histologie',
      examTypes: JSON.stringify(['Histologie']),
      globalTimeout: 7,
    },
  });

  const nodes = [
    {
      id: 'hi-start',
      type: 'start',
      label: 'Examen effectué',
      col: 0,
      row: 0,
      config: {},
    },
    {
      id: 'hi-email-1',
      type: 'email',
      label: 'Email initial',
      col: 1,
      row: 0,
      config: {
        subject: 'Résultat disponible — Examen {ref_examen}',
        body:
          'Bonjour {prenom_patient},\n\n' +
          "Votre examen réf. {ref_examen} du {date_examen} est disponible au retrait.\n\n" +
          'Merci de contacter le laboratoire {nom_labo}.',
      },
    },
    {
      id: 'hi-email-2',
      type: 'email',
      label: 'Relance email',
      col: 1,
      row: 1,
      config: {
        subject: 'Rappel — Résultat en attente {ref_examen}',
        body:
          'Bonjour {prenom_patient},\n\n' +
          "Nous vous rappelons que votre résultat d'examen réf. {ref_examen} " +
          "est toujours en attente de retrait.\n\nCordialement,\n{nom_labo}",
      },
    },
    {
      id: 'hi-sms-1',
      type: 'sms',
      label: 'SMS de rappel',
      col: 2,
      row: 0,
      config: {
        body:
          'Résultat dispo pour {ref_examen}. Contactez votre labo {nom_labo}.',
      },
    },
    {
      id: 'hi-sms-2',
      type: 'sms',
      label: 'Relance SMS',
      col: 2,
      row: 1,
      config: {
        body:
          'Rappel : votre résultat {ref_examen} est toujours en attente. {nom_labo}',
      },
    },
    {
      id: 'hi-whatsapp-1',
      type: 'whatsapp',
      label: 'Message WhatsApp',
      col: 3,
      row: 0,
      config: {
        body:
          "Bonjour {prenom_patient}, votre résultat d'examen est prêt. Merci de contacter {nom_labo}.",
      },
    },
    {
      id: 'hi-courrier-1',
      type: 'courrier',
      label: 'Courrier recommandé',
      col: 4,
      row: 0,
      config: {
        body:
          'Madame, Monsieur {nom_patient},\n\n' +
          "Nous vous informons que les résultats de votre examen réf. {ref_examen} " +
          'effectué le {date_examen} sont disponibles.\n\n' +
          'Veuillez vous rapprocher de notre laboratoire pour les retirer.\n\n' +
          'Cordialement,\n{nom_labo}',
      },
    },
    {
      id: 'hi-appel-1',
      type: 'appel',
      label: 'Appel direct',
      col: 5,
      row: 0,
      config: {
        notes:
          "Appel téléphonique pour {prenom_patient} concernant l'examen {ref_examen}. Confirmer le retrait du résultat.",
      },
    },
    {
      id: 'hi-end',
      type: 'end',
      label: 'Résultat retiré',
      col: 6,
      row: 0,
      config: {},
    },
  ];

  for (const n of nodes) {
    const p = pos(n.col, n.row);
    await prisma.node.create({
      data: {
        id: n.id,
        workflowId: workflow.id,
        type: n.type,
        label: n.label,
        positionX: p.x,
        positionY: p.y,
        gridCol: n.col,
        gridRow: n.row,
        config: JSON.stringify(n.config),
      },
    });
  }

  const edges = [
    { id: 'hi-e-start-email', src: 'hi-start', tgt: 'hi-email-1', type: 'escalation', delay: null },
    { id: 'hi-e-email-relance', src: 'hi-email-1', tgt: 'hi-email-2', type: 'reminder', delay: 7 },
    { id: 'hi-e-email-sms', src: 'hi-email-1', tgt: 'hi-sms-1', type: 'escalation', delay: null },
    { id: 'hi-e-sms-relance', src: 'hi-sms-1', tgt: 'hi-sms-2', type: 'reminder', delay: 3 },
    { id: 'hi-e-sms-whatsapp', src: 'hi-sms-1', tgt: 'hi-whatsapp-1', type: 'escalation', delay: null },
    { id: 'hi-e-whatsapp-courrier', src: 'hi-whatsapp-1', tgt: 'hi-courrier-1', type: 'escalation', delay: null },
    { id: 'hi-e-courrier-appel', src: 'hi-courrier-1', tgt: 'hi-appel-1', type: 'escalation', delay: null },
    { id: 'hi-e-appel-end', src: 'hi-appel-1', tgt: 'hi-end', type: 'escalation', delay: null },
  ];

  for (const e of edges) {
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

  return { workflowId: workflow.id, name: workflow.name, nodes: nodes.length, edges: edges.length };
}

async function buildCytologieWorkflow() {
  const workflow = await prisma.workflow.create({
    data: {
      name: 'Relance résultats — Cytologie',
      examTypes: JSON.stringify(['Cytologie']),
      globalTimeout: 7,
    },
  });

  const nodes = [
    { id: 'cy-start', type: 'start', label: 'Examen effectué', col: 0, row: 0, config: {} },
    {
      id: 'cy-email',
      type: 'email',
      label: 'Email initial',
      col: 1,
      row: 0,
      config: {
        subject: 'Résultat de votre examen — {ref_examen}',
        body:
          'Bonjour {prenom_patient},\n\nVotre résultat est disponible. Merci de contacter {nom_labo}.',
      },
    },
    {
      id: 'cy-sms',
      type: 'sms',
      label: 'SMS',
      col: 2,
      row: 0,
      config: {
        body:
          'Résultat dispo {ref_examen}. Merci de contacter {nom_labo}.',
      },
    },
    {
      id: 'cy-appel',
      type: 'appel',
      label: 'Appel patient',
      col: 3,
      row: 0,
      config: {
        notes: 'Appel pour {prenom_patient}. Confirmer le retrait du résultat.',
      },
    },
    { id: 'cy-end', type: 'end', label: 'Résultat retiré', col: 4, row: 0, config: {} },
  ];

  for (const n of nodes) {
    const p = pos(n.col, n.row);
    await prisma.node.create({
      data: {
        id: n.id,
        workflowId: workflow.id,
        type: n.type,
        label: n.label,
        positionX: p.x,
        positionY: p.y,
        gridCol: n.col,
        gridRow: n.row,
        config: JSON.stringify(n.config),
      },
    });
  }

  const edges = [
    { id: 'cy-e-start-email', src: 'cy-start', tgt: 'cy-email', type: 'escalation', delay: null },
    { id: 'cy-e-email-sms', src: 'cy-email', tgt: 'cy-sms', type: 'escalation', delay: null },
    { id: 'cy-e-sms-appel', src: 'cy-sms', tgt: 'cy-appel', type: 'escalation', delay: null },
    { id: 'cy-e-appel-end', src: 'cy-appel', tgt: 'cy-end', type: 'escalation', delay: null },
  ];

  for (const e of edges) {
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

  return { workflowId: workflow.id, name: workflow.name, nodes: nodes.length, edges: edges.length };
}

async function main() {
  await prisma.edge.deleteMany();
  await prisma.node.deleteMany();
  await prisma.workflow.deleteMany();

  const histo = await buildHistologieWorkflow();
  const cyto = await buildCytologieWorkflow();

  console.log('✅ Seed complete!');
  console.log(`   ${histo.name} — ${histo.nodes} nodes, ${histo.edges} edges`);
  console.log(`   ${cyto.name} — ${cyto.nodes} nodes, ${cyto.edges} edges`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
