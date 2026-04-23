import { useState } from "react";
import { getWorkflowToken, setWorkflowToken } from "../../lib/workflowApi";

export function TokenChip() {
  const [value, setValue] = useState(getWorkflowToken());
  const [editing, setEditing] = useState(false);
  const masked = value
    ? `${value.slice(0, 4)}…${value.slice(-4)}`
    : "(absent)";

  if (!editing) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-text-muted">Bearer</span>
        <code className="rounded bg-border-glass px-2 py-0.5 font-mono">
          {masked}
        </code>
        <button
          onClick={() => setEditing(true)}
          className="rounded border border-border-glass px-2 py-0.5 text-xs hover:bg-surface-hover"
        >
          {value ? "change" : "set"}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setWorkflowToken(value.trim());
        setEditing(false);
      }}
      className="flex items-center gap-2"
    >
      <input
        type="password"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="F4L_BEARER_TOKEN"
        className="rounded border border-border-glass bg-surface-bg px-2 py-1 font-mono text-xs"
      />
      <button
        type="submit"
        className="rounded bg-accent-green/20 px-2 py-1 text-xs text-accent-green"
      >
        save
      </button>
      <button
        type="button"
        className="rounded border border-border-glass px-2 py-1 text-xs"
        onClick={() => {
          setValue(getWorkflowToken());
          setEditing(false);
        }}
      >
        cancel
      </button>
    </form>
  );
}
