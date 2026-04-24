import { useModels, type Capability } from "../hooks/useModels";

export interface ModelDropdownProps {
  capability?: Capability;
  value: string;
  onChange: (modelId: string) => void;
  className?: string;
}

export function ModelDropdown({
  capability,
  value,
  onChange,
  className,
}: ModelDropdownProps) {
  const { grouped, isLoading, isError } = useModels({ capability });

  if (isLoading) {
    return <span className="text-text-muted">…</span>;
  }
  if (isError || !grouped) {
    return (
      <span className="text-accent-red">models unavailable</span>
    );
  }

  const selectClass =
    className ??
    "rounded-lg border border-border-glass bg-surface-card px-3 py-1.5 text-xs text-text-primary";
  const entries = Object.entries(grouped);
  const hasSelected = entries.some(([, ids]) => ids.includes(value));

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={selectClass}
    >
      {!hasSelected && value && <option value={value}>{value}</option>}
      {entries.map(([group, ids]) => (
        <optgroup key={group} label={group}>
          {ids.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
