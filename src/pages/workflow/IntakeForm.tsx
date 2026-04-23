import { useState } from "react";
import { useCreateIntake } from "../../hooks/useWorkflow";
import { getWorkflowToken } from "../../lib/workflowApi";

export function IntakeForm() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"A" | "B">("A");
  const [profile, setProfile] = useState<"prototype" | "iot_wifi_eu">(
    "prototype"
  );
  const [details, setDetails] = useState("");
  const create = useCreateIntake();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!getWorkflowToken()) {
      alert("Set the bearer token first (top of the page).");
      return;
    }
    create.mutate(
      { title, deliverable_type: type, details, compliance_profile: profile },
      {
        onSuccess: () => {
          setTitle("");
          setDetails("");
        },
      }
    );
  };

  return (
    <form
      onSubmit={submit}
      className="grid grid-cols-1 gap-3 md:grid-cols-2"
    >
      <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-text-muted">
        Title
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. KXKM parallelator v2"
          className="rounded-lg border border-border-glass bg-surface-bg px-3 py-2 text-sm font-normal normal-case tracking-normal text-text-primary"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-text-muted">
        Deliverable type
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "A" | "B")}
          className="rounded-lg border border-border-glass bg-surface-bg px-3 py-2 text-sm font-normal normal-case tracking-normal text-text-primary"
        >
          <option value="A">A — hardware evidence pack</option>
          <option value="B">B — product increment</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-text-muted">
        Compliance profile
        <select
          value={profile}
          onChange={(e) =>
            setProfile(e.target.value as "prototype" | "iot_wifi_eu")
          }
          className="rounded-lg border border-border-glass bg-surface-bg px-3 py-2 text-sm font-normal normal-case tracking-normal text-text-primary"
        >
          <option value="prototype">prototype</option>
          <option value="iot_wifi_eu">iot_wifi_eu</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-text-muted md:col-span-2">
        Details
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Goal + initial constraints"
          className="min-h-[80px] resize-y rounded-lg border border-border-glass bg-surface-bg px-3 py-2 text-sm font-normal normal-case tracking-normal text-text-primary"
        />
      </label>
      <div className="flex items-center justify-end gap-3 md:col-span-2">
        {create.isError && (
          <span className="text-xs text-accent-red">
            {(create.error as Error).message}
          </span>
        )}
        {create.isSuccess && (
          <span className="text-xs text-accent-green">
            Created {create.data.slug ?? create.data.intake_id}
          </span>
        )}
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded-lg bg-accent-green/20 px-4 py-2 text-sm text-accent-green hover:bg-accent-green/30 disabled:opacity-50"
        >
          {create.isPending ? "Creating…" : "Create intake"}
        </button>
      </div>
    </form>
  );
}
