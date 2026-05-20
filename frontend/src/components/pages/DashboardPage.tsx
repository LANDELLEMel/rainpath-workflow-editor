import { useCallback, useMemo, useState } from 'react';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Search } from 'lucide-react';
import { CHANNEL_CONFIG } from '../../config/channels';
import { buildInitialColumns } from '../../data/mockPatients';
import { PatientDetailPanel } from '../panels/PatientDetailPanel';
import type {
  KanbanColumn,
  Patient,
  PatientStatus,
  PatientUrgence,
} from '../../types/dashboard';

const URGENCE_COLOR: Record<PatientUrgence, string> = {
  normal: '#10B981',
  urgent: '#F59E0B',
  critique: '#EF4444',
};

function PatientCard({
  patient,
  onClick,
}: {
  patient: Patient;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: patient.id });

  const channelCfg = CHANNEL_CONFIG[patient.canal];
  const ChannelIcon = channelCfg.icon;
  const urgenceColor = URGENCE_COLOR[patient.urgence];

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow transition-all duration-150"
    >
      <PatientCardContent patient={patient}>
        <ChannelIcon size={12} color={channelCfg.color} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: urgenceColor }} />
      </PatientCardContent>
    </div>
  );
}

function PatientCardContent({
  patient,
  children,
}: {
  patient: Patient;
  children?: React.ReactNode;
}) {
  const channelCfg = CHANNEL_CONFIG[patient.canal];

  return (
    <>
      <div className="text-sm font-medium text-gray-900 truncate">
        {patient.nom}
      </div>
      <div className="text-xs text-gray-500 truncate mt-0.5">
        {patient.examType}
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
          style={{
            backgroundColor: channelCfg.light,
            color: channelCfg.color,
          }}
        >
          {children}
          <span className="ml-0.5">{channelCfg.label}</span>
        </span>
        <span className="text-[10px] font-medium text-gray-400">
          {patient.jours} j
        </span>
      </div>
    </>
  );
}

function DragOverlayCard({ patient }: { patient: Patient }) {
  const channelCfg = CHANNEL_CONFIG[patient.canal];
  const ChannelIcon = channelCfg.icon;
  const urgenceColor = URGENCE_COLOR[patient.urgence];
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 shadow-md p-3 w-[204px] cursor-grabbing"
      style={{ transform: 'rotate(2deg)' }}
    >
      <PatientCardContent patient={patient}>
        <ChannelIcon size={12} color={channelCfg.color} />
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: urgenceColor }} />
      </PatientCardContent>
    </div>
  );
}

function Column({
  column,
  onSelectPatient,
}: {
  column: KanbanColumn;
  onSelectPatient: (p: Patient) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const patientIds = useMemo(
    () => column.patients.map((p) => p.id),
    [column.patients],
  );

  return (
    <div className="bg-gray-50 rounded-xl min-w-[220px] w-[220px] flex flex-col max-h-[calc(100vh-180px)] shrink-0">
      <div
        className="px-3 py-2.5 border-b border-gray-200 bg-white"
        style={{
          borderTopColor: column.color,
          borderTopWidth: 3,
          borderTopStyle: 'solid',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {column.title}
          </span>
          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
            {column.patients.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-2 flex flex-col gap-2 min-h-[120px] rounded-b-xl transition-colors duration-150 ${
          isOver ? 'bg-gray-100' : ''
        }`}
      >
        <SortableContext
          items={patientIds}
          strategy={verticalListSortingStrategy}
        >
          {column.patients.map((p) => (
            <PatientCard
              key={p.id}
              patient={p}
              onClick={() => onSelectPatient(p)}
            />
          ))}
        </SortableContext>
        {column.patients.length === 0 && (
          <div className="text-[11px] text-gray-300 text-center py-6">
            Aucun patient
          </div>
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>(() =>
    buildInitialColumns(),
  );
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const filterText = searchQuery.trim().toLowerCase();
  const filteredColumns = useMemo(() => {
    if (!filterText) return columns;
    return columns.map((c) => ({
      ...c,
      patients: c.patients.filter(
        (p) =>
          p.nom.toLowerCase().includes(filterText) ||
          p.examType.toLowerCase().includes(filterText),
      ),
    }));
  }, [columns, filterText]);

  const totalPatients = useMemo(
    () => columns.reduce((acc, c) => acc + c.patients.length, 0),
    [columns],
  );

  const findColumnIdOfPatient = useCallback(
    (patientId: string): PatientStatus | null => {
      const col = columns.find((c) =>
        c.patients.some((p) => p.id === patientId),
      );
      return col?.id ?? null;
    },
    [columns],
  );

  const findActivePatient = useCallback(
    (patientId: string): Patient | null => {
      for (const c of columns) {
        const p = c.patients.find((x) => x.id === patientId);
        if (p) return p;
      }
      return null;
    },
    [columns],
  );

  const activePatient = activeDragId
    ? findActivePatient(activeDragId)
    : null;

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveDragId(String(e.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      setActiveDragId(null);
      const { active, over } = e;
      if (!over) return;
      const activeId = String(active.id);
      const overId = String(over.id);

      const sourceCol = findColumnIdOfPatient(activeId);
      if (!sourceCol) return;

      // overId est soit un id de colonne, soit un id de patient.
      const targetCol: PatientStatus | null = (() => {
        if (columns.some((c) => c.id === overId)) {
          return overId as PatientStatus;
        }
        return findColumnIdOfPatient(overId);
      })();
      if (!targetCol || targetCol === sourceCol) return;

      setColumns((prev) => {
        const next = prev.map((c) => ({
          ...c,
          patients: c.patients.slice(),
        }));
        const sourceCard = next.find((c) => c.id === sourceCol)!;
        const targetCard = next.find((c) => c.id === targetCol)!;
        const idx = sourceCard.patients.findIndex((p) => p.id === activeId);
        if (idx < 0) return prev;
        const [moved] = sourceCard.patients.splice(idx, 1);
        moved.status = targetCol;
        targetCard.patients.push(moved);
        return next;
      });

      setSelectedPatient((cur) =>
        cur && cur.id === activeId
          ? { ...cur, status: targetCol }
          : cur,
      );
    },
    [columns, findColumnIdOfPatient],
  );

  const handleChangePatientStatus = useCallback(
    (patientId: string, newStatus: PatientStatus) => {
      setColumns((prev) => {
        const next = prev.map((c) => ({
          ...c,
          patients: c.patients.slice(),
        }));
        let moved: Patient | null = null;
        for (const c of next) {
          const idx = c.patients.findIndex((p) => p.id === patientId);
          if (idx >= 0) {
            [moved] = c.patients.splice(idx, 1);
            break;
          }
        }
        if (!moved) return prev;
        moved.status = newStatus;
        const target = next.find((c) => c.id === newStatus);
        if (!target) return prev;
        target.patients.push(moved);
        return next;
      });
      setSelectedPatient((cur) =>
        cur && cur.id === patientId
          ? { ...cur, status: newStatus }
          : cur,
      );
    },
    [],
  );

  return (
    <div className="relative h-full flex flex-col bg-[#FAFAFA]">
      <header className="px-6 pt-6 pb-4 flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Suivi des relances
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Données de démonstration · {totalPatients} patients
          </p>
        </div>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un patient ou un examen..."
            className="w-72 h-9 pl-8 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-[#E85D4A] focus:ring-2 focus:ring-[#E85D4A]/20 transition-all duration-150"
          />
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-3 overflow-x-auto overflow-y-hidden px-6 pb-6">
          {filteredColumns.map((col) => (
            <Column
              key={col.id}
              column={col}
              onSelectPatient={setSelectedPatient}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activePatient && <DragOverlayCard patient={activePatient} />}
        </DragOverlay>
      </DndContext>

      <PatientDetailPanel
        patient={selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onChangeStatus={handleChangePatientStatus}
      />
    </div>
  );
}
