import { useEffect, useRef, useState } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';
import { EXAM_TYPES } from '../config/examTypes';

export interface ExamTypeSelectProps {
  value: string[];
  onChange: (next: string[]) => void;
  readOnly?: boolean;
}

export function ExamTypeSelect({
  value,
  onChange,
  readOnly = false,
}: ExamTypeSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (readOnly && open) setOpen(false);
  }, [readOnly, open]);

  function toggle(type: string) {
    if (value.includes(type)) {
      onChange(value.filter((t) => t !== type));
    } else {
      onChange([...value, type]);
    }
  }

  function remove(type: string) {
    onChange(value.filter((t) => t !== type));
  }

  if (readOnly) {
    if (value.length === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400 opacity-80">
          Aucun type
        </span>
      );
    }
    return (
      <div className="flex items-center gap-1.5 flex-wrap opacity-80">
        {value.map((t) => (
          <span
            key={t}
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
          >
            {t}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-1.5 flex-wrap">
        {value.length === 0 ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-colors duration-150"
          >
            Types d'examen
            <ChevronDown size={12} />
          </button>
        ) : (
          <>
            {value.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
              >
                {t}
                <button
                  type="button"
                  onClick={() => remove(t)}
                  className="hover:text-gray-900 transition-colors duration-100"
                  aria-label={`Retirer ${t}`}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-gray-500 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D4A]/20 transition-colors duration-150"
              aria-label="Modifier types d'examen"
            >
              <ChevronDown size={12} />
            </button>
          </>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-md py-1 z-20 max-h-72 overflow-y-auto">
          {EXAM_TYPES.map((t) => {
            const selected = value.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggle(t)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors duration-100 text-gray-700"
              >
                <span>{t}</span>
                {selected && (
                  <Check size={12} className="text-[#E85D4A]" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
