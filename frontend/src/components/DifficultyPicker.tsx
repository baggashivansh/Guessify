import type { Difficulty } from '../types';
import { DIFFICULTIES } from '../types';

interface DifficultyPickerProps {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
  large?: boolean;
}

export function DifficultyPicker({ value, onChange, large }: DifficultyPickerProps) {
  return (
    <div className={`grid gap-3 ${large ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-3'}`}>
      {DIFFICULTIES.map((d) => (
        <button
          key={d.key}
          type="button"
          onClick={() => onChange(d.key)}
          className={`text-left rounded-2xl border transition-all duration-200 ${
            large ? 'p-6' : 'p-4'
          } ${
            value === d.key
              ? 'border-accent bg-accent-soft shadow-glow ring-1 ring-accent/20'
              : 'border-surface-border bg-white hover:border-accent/30 hover:shadow-sm'
          }`}
        >
          <div className={`font-display font-semibold text-ink ${large ? 'text-xl' : 'text-base'}`}>
            {d.label}
          </div>
          <div className="text-accent text-sm mt-1 font-medium">{d.range}</div>
          {large && <div className="text-ink-muted text-sm mt-2">{d.description}</div>}
        </button>
      ))}
    </div>
  );
}
