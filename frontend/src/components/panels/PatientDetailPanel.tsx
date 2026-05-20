import { useEffect } from 'react';
import { X } from 'lucide-react';
import { CHANNEL_CONFIG } from '../../config/channels';
import { STATUS_COLOR, STATUS_LABEL } from '../../data/mockPatients';
import type {
  Patient,
  PatientStatus,
  PatientUrgence,
} from '../../types/dashboard';

const URGENCE_LABEL: Record<PatientUrgence, string> = {
  normal: 'Normal',
  urgent: 'Urgent',
  critique: 'Critique',
};

const URGENCE_COLOR: Record<PatientUrgence, string> = {
  normal: '#10B981',
  urgent: '#F59E0B',
  critique: '#EF4444',
};

const STATUS_ORDER: PatientStatus[] = [
  'en_attente',
  'relance_1',
  'relance_2',
  'relance_3',
  'recupere',
  'expire',
];

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export interface PatientDetailPanelProps {
  patient: Patient | null;
  onClose: () => void;
  onChangeStatus: (patientId: string, status: PatientStatus) => void;
}

export function PatientDetailPanel({
  patient,
  onClose,
  onChangeStatus,
}: PatientDetailPanelProps) {
  useEffect(() => {
    if (!patient) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [patient, onClose]);

  if (!patient) return null;

  const channelCfg = CHANNEL_CONFIG[patient.canal];
  const ChannelIcon = channelCfg.icon;
  const urgenceColor = URGENCE_COLOR[patient.urgence];

  return (
    <aside
      role="dialog"
      aria-label="Détails patient"
      className="absolute top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-30 flex flex-col animate-[fadeIn_200ms_ease-out]"
      style={{
        transform: 'translateX(0)',
        transition:
          'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <header className="flex items-center justify-between px-4 h-12 border-b border-gray-200 shrink-0">
        <span className="text-sm font-semibold text-gray-900">
          Détails patient
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-colors duration-150"
        >
          <X size={16} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <div className="text-xl font-bold text-gray-900">
            {patient.nom}
          </div>
          <div className="mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {patient.examType}
            </span>
          </div>
        </div>

        <div className="h-px bg-gray-100" />

        <dl className="space-y-3">
          <Row label="Canal">
            <span className="inline-flex items-center gap-1.5">
              <ChannelIcon size={14} color={channelCfg.color} />
              <span className="text-sm font-medium text-gray-900">
                {channelCfg.label}
              </span>
            </span>
          </Row>
          <Row label="Date examen">
            <span className="text-sm font-medium text-gray-900">
              {formatDate(patient.dateExamen)}
            </span>
          </Row>
          <Row label="Jours">
            <span
              className="text-sm font-medium"
              style={{ color: urgenceColor }}
            >
              {patient.jours} j
            </span>
          </Row>
          <Row label="Urgence">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: urgenceColor }}
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-gray-900">
                {URGENCE_LABEL[patient.urgence]}
              </span>
            </span>
          </Row>
          <Row label="Dernière relance">
            <span className="text-sm font-medium text-gray-900">
              {patient.dateDerniereRelance
                ? formatDate(patient.dateDerniereRelance)
                : '—'}
            </span>
          </Row>
        </dl>

        <div className="h-px bg-gray-100" />

        <div className="space-y-1.5">
          <label
            htmlFor="patient-status"
            className="block text-xs font-medium text-gray-500 uppercase tracking-wide"
          >
            Statut
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none"
              style={{ backgroundColor: STATUS_COLOR[patient.status] }}
              aria-hidden="true"
            />
            <select
              id="patient-status"
              value={patient.status}
              onChange={(e) =>
                onChangeStatus(
                  patient.id,
                  e.target.value as PatientStatus,
                )
              }
              className="w-full h-9 pl-7 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-[#E85D4A] focus:ring-2 focus:ring-[#E85D4A]/20 transition-all duration-150"
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
