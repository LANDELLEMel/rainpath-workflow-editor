# Phase 4C — Corrections

## Fix 1 — Guard click après drag sur PatientCard

Fichier : `frontend/src/components/pages/DashboardPage.tsx`

Dans le composant `PatientCard`, le `onClick` doit être ignoré si on vient de drag. Modifier le handler :

```tsx
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

  // Empêcher l'ouverture du panel après un drag
  const handleClick = () => {
    if (!isDragging) onClick();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow transition-all duration-150"
    >
      ...
    </div>
  );
}
```

**Note** : le check `isDragging` devrait suffire car dnd-kit met `isDragging` à true pendant le drag. Cependant, dans certains cas, le click peut arriver juste après que `isDragging` repasse à false. Une approche plus robuste est d'utiliser un ref :

```tsx
import { useRef } from 'react';

function PatientCard({ patient, onClick }: { patient: Patient; onClick: () => void }) {
  const wasDraggingRef = useRef(false);
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: patient.id });

  // Track si un drag a eu lieu
  if (isDragging) wasDraggingRef.current = true;

  const handleClick = () => {
    if (wasDraggingRef.current) {
      wasDraggingRef.current = false;
      return;
    }
    onClick();
  };

  // ... rest unchanged
}
```

## Fix 2 — Animation slide-in / slide-out du PatientDetailPanel

Fichier : `frontend/src/components/panels/PatientDetailPanel.tsx`

Le panel doit rester toujours monté et se déplacer en `translateX`. Remplacer le pattern `if (!patient) return null` par un panel toujours rendu avec une transition transform.

Remplacer tout le composant `PatientDetailPanel` :

```tsx
export function PatientDetailPanel({
  patient,
  onClose,
  onChangeStatus,
}: PatientDetailPanelProps) {
  const isOpen = patient !== null;

  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay semi-transparent — cliquable pour fermer */}
      <div
        className="absolute inset-0 bg-black/5 z-20 transition-opacity duration-250"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel slide-in depuis la droite */}
      <aside
        role="dialog"
        aria-label="Détails patient"
        className="absolute top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-30 flex flex-col"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Ne rendre le contenu que si un patient est sélectionné — évite le flash vide */}
        {patient && (
          <>
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
              {/* ... tout le contenu existant (nom, examType, infos, select statut) ... */}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
```

Le contenu intérieur (nom, dl, select) ne change pas — seul le wrapper change pour gérer l'animation.

**Important** : il faut gérer le fait que le contenu reste visible pendant l'animation de sortie. On peut utiliser un state `lastPatient` pour garder le contenu visible pendant le slide-out :

```tsx
export function PatientDetailPanel({
  patient,
  onClose,
  onChangeStatus,
}: PatientDetailPanelProps) {
  const isOpen = patient !== null;
  // Garder le dernier patient pour l'animation de sortie
  const [displayedPatient, setDisplayedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (patient) {
      setDisplayedPatient(patient);
    }
    // Ne PAS effacer displayedPatient quand patient devient null — il s'efface quand la transition finit
  }, [patient]);

  // Effacer le contenu après la transition de sortie
  const handleTransitionEnd = () => {
    if (!isOpen) setDisplayedPatient(null);
  };

  // Le contenu à afficher (patient actif ou dernier patient pendant le slide-out)
  const shown = patient ?? displayedPatient;

  // ... Escape handler avec isOpen

  return (
    <>
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/5 z-20 transition-opacity duration-250"
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-label="Détails patient"
        className="absolute top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-30 flex flex-col"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {shown && (
          <>
            {/* header + contenu identique à avant, mais en utilisant `shown` au lieu de `patient` */}
            {/* SAUF pour onChangeStatus : utiliser shown.id / shown.status */}
          </>
        )}
      </aside>
    </>
  );
}
```

Ajouter `useState` dans les imports en haut du fichier.

## Vérifications

1. `cd frontend && npx tsc --noEmit` → 0 erreur
2. Vérifier :
   - Le panel glisse depuis la droite à l'ouverture (slide-in)
   - Le panel glisse vers la droite à la fermeture (slide-out) — le contenu reste visible pendant l'animation
   - L'overlay semi-transparent apparaît/disparaît en fondu
   - Drag & drop d'un patient NE déclenche PAS l'ouverture du panel
   - Cliquer sans drag ouvre bien le panel
3. Git commit : `fix: Phase 4C — slide panel animation + drag click guard`
