import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { GlassCard } from "@finefab/ui";
import { CheckCircle, Circle, ExternalLink } from "lucide-react";
import { useCreateProject } from "../../hooks/useWorkflowProject";
import { getWorkflowToken } from "../../lib/workflowApi";
import { TokenChip } from "./TokenChip";

type Step = 0 | 1 | 2 | 3 | 4;

type FirmwareTarget = "esp32" | "stm32" | "rp2040" | "native" | "none";
type ComplianceProfile = "prototype" | "iot_wifi_eu" | "iot_bt_fcc";

interface WizardState {
  name: string;
  slug: string;
  client_slug: string;
  client_name: string;
  description: string;
  compliance_profile: ComplianceProfile;
  has_hardware: boolean;
  has_firmware: boolean;
  firmware_target: FirmwareTarget;
}

const INITIAL: WizardState = {
  name: "",
  slug: "",
  client_slug: "",
  client_name: "",
  description: "",
  compliance_profile: "prototype",
  has_hardware: true,
  has_firmware: true,
  firmware_target: "esp32",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function ProjectWizard() {
  const nav = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [state, setState] = useState<WizardState>(INITIAL);
  const create = useCreateProject();
  const [result, setResult] = useState<{
    slug: string;
    repo: string;
    deliverables: string[];
  } | null>(null);

  const patch = (p: Partial<WizardState>) => setState((s) => ({ ...s, ...p }));

  const step0Valid = state.name.trim().length > 0 && state.slug.length >= 2;
  const step1Valid =
    state.client_slug.trim().length > 0 && state.compliance_profile.length > 0;
  const canNext =
    (step === 0 && step0Valid) ||
    (step === 1 && step1Valid) ||
    step === 2 ||
    step === 3;

  const submit = async () => {
    if (!getWorkflowToken()) {
      alert("Set the bearer token first (Workflow list page).");
      return;
    }
    try {
      const r = await create.mutateAsync({
        name: state.name,
        slug: state.slug,
        client_slug: state.client_slug,
        client_name: state.client_name || undefined,
        description: state.description || undefined,
        compliance_profile: state.compliance_profile,
        has_hardware: state.has_hardware,
        has_firmware: state.has_firmware,
        firmware_target: state.has_firmware ? state.firmware_target : "none",
      });
      setResult(r);
      setStep(4);
    } catch {
      // create.error surfaced below
    }
  };

  return (
    <div className="space-y-4 p-4">
      <Link
        to="/workflow"
        className="text-sm text-accent-green hover:underline"
      >
        ← back to workflow list
      </Link>

      <GlassCard>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-text-primary">
            Create a new project
          </h2>
          <div className="flex items-center gap-3">
            <Stepper step={step} />
            <TokenChip />
          </div>
        </div>

        {step === 0 && (
          <StepIdentity state={state} patch={patch} slugify={slugify} />
        )}
        {step === 1 && <StepClient state={state} patch={patch} />}
        {step === 2 && <StepHardware state={state} patch={patch} />}
        {step === 3 && <StepFirmware state={state} patch={patch} />}
        {step === 4 && result && (
          <StepReview
            state={state}
            result={result}
            onOpenDeliverables={() => nav({ to: "/workflow" })}
          />
        )}

        {step !== 4 && (
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-border-glass pt-4">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => (Math.max(0, s - 1) as Step))}
              className="rounded-lg border border-border-glass px-4 py-2 text-sm text-text-primary hover:bg-surface-hover disabled:opacity-40"
            >
              Back
            </button>
            {create.isError && (
              <span className="flex-1 truncate px-3 text-sm text-accent-red">
                {(create.error as Error).message}
              </span>
            )}
            {step < 3 && (
              <button
                type="button"
                disabled={!canNext}
                onClick={() => setStep((s) => (Math.min(3, s + 1) as Step))}
                className="rounded-lg bg-accent-green/20 px-4 py-2 text-sm text-accent-green hover:bg-accent-green/30 disabled:opacity-40"
              >
                Next
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                disabled={create.isPending}
                onClick={submit}
                className="rounded-lg bg-accent-green/30 px-4 py-2 text-sm font-semibold text-accent-green hover:bg-accent-green/40 disabled:opacity-40"
              >
                {create.isPending ? "Creating…" : "Create project"}
              </button>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const labels = ["Identity", "Client", "Hardware", "Firmware", "Review"];
  return (
    <ol className="flex items-center gap-2 text-xs">
      {labels.map((l, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li
            key={l}
            className={`flex items-center gap-1 ${
              done
                ? "text-accent-green"
                : active
                  ? "text-text-primary"
                  : "text-text-muted"
            }`}
          >
            {done ? <CheckCircle size={14} /> : <Circle size={14} />}
            <span>{l}</span>
            {i < labels.length - 1 && (
              <span className="mx-1 text-text-muted">→</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function fieldClasses(): string {
  return "w-full rounded-lg border border-border-glass bg-surface-bg px-3 py-2 text-sm text-text-primary";
}

function labelClasses(): string {
  return "mb-1 block text-xs uppercase tracking-wider text-text-muted";
}

function StepIdentity({
  state,
  patch,
  slugify,
}: {
  state: WizardState;
  patch: (p: Partial<WizardState>) => void;
  slugify: (s: string) => string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className={labelClasses()}>Project name</label>
        <input
          className={fieldClasses()}
          placeholder="e.g. Battery 48V SmartCell"
          value={state.name}
          onChange={(e) => {
            const name = e.target.value;
            patch({
              name,
              // Auto-fill slug unless user already tweaked it.
              slug: state.slug === slugify(state.name) || state.slug === ""
                ? slugify(name)
                : state.slug,
            });
          }}
        />
      </div>
      <div>
        <label className={labelClasses()}>Slug</label>
        <input
          className={fieldClasses() + " font-mono"}
          value={state.slug}
          placeholder="battery-48v-smartcell"
          onChange={(e) =>
            patch({
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
            })
          }
        />
        <p className="mt-1 text-xs text-text-muted">
          Repo will be named{" "}
          <code className="rounded bg-border-glass px-1">
            f4l-{state.slug || "..."}
          </code>
        </p>
      </div>
      <div className="md:col-span-2">
        <label className={labelClasses()}>Description</label>
        <textarea
          className={fieldClasses()}
          rows={3}
          placeholder="Goal + initial constraints"
          value={state.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
      </div>
    </div>
  );
}

function StepClient({
  state,
  patch,
}: {
  state: WizardState;
  patch: (p: Partial<WizardState>) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div>
        <label className={labelClasses()}>Client slug</label>
        <input
          className={fieldClasses() + " font-mono"}
          placeholder="kxkm"
          value={state.client_slug}
          onChange={(e) =>
            patch({
              client_slug: e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9-]/g, ""),
            })
          }
        />
      </div>
      <div>
        <label className={labelClasses()}>Client display name</label>
        <input
          className={fieldClasses()}
          placeholder="KXKM (optional)"
          value={state.client_name}
          onChange={(e) => patch({ client_name: e.target.value })}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelClasses()}>Compliance profile</label>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { v: "prototype", label: "Prototype", hint: "No cert required" },
              { v: "iot_wifi_eu", label: "IoT Wi-Fi EU", hint: "CE + RED" },
              { v: "iot_bt_fcc", label: "IoT BT FCC", hint: "FCC + ISED" },
            ] as const
          ).map((opt) => {
            const sel = state.compliance_profile === opt.v;
            return (
              <button
                key={opt.v}
                type="button"
                onClick={() => patch({ compliance_profile: opt.v })}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  sel
                    ? "border-accent-green bg-accent-green/10"
                    : "border-border-glass bg-surface-bg hover:bg-surface-hover"
                }`}
              >
                <div className="text-sm font-semibold text-text-primary">
                  {opt.label}
                </div>
                <div className="text-xs text-text-muted">{opt.hint}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepHardware({
  state,
  patch,
}: {
  state: WizardState;
  patch: (p: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-glass bg-surface-bg p-4 text-sm">
        <input
          type="checkbox"
          checked={state.has_hardware}
          onChange={(e) => patch({ has_hardware: e.target.checked })}
          className="h-4 w-4"
        />
        <span>
          <span className="font-semibold text-text-primary">
            This project has a KiCad schematic
          </span>
          <span className="ml-2 text-text-muted">
            seeds{" "}
            <code className="rounded bg-border-glass px-1">hardware/</code>{" "}
            directory
          </span>
        </span>
      </label>
      {state.has_hardware && (
        <p className="text-xs text-text-muted">
          The <code>hardware/</code> folder is initialized empty but tracked so
          KiCad projects can be added later without touching the deliverable
          structure.
        </p>
      )}
    </div>
  );
}

function StepFirmware({
  state,
  patch,
}: {
  state: WizardState;
  patch: (p: Partial<WizardState>) => void;
}) {
  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-glass bg-surface-bg p-4 text-sm">
        <input
          type="checkbox"
          checked={state.has_firmware}
          onChange={(e) => patch({ has_firmware: e.target.checked })}
          className="h-4 w-4"
        />
        <span className="font-semibold text-text-primary">
          This project has firmware
        </span>
      </label>
      {state.has_firmware && (
        <div>
          <label className={labelClasses()}>MCU family</label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {(
              [
                { v: "esp32", label: "ESP32 / ESP32-S3", sdk: "ESP-IDF 5.4+" },
                { v: "stm32", label: "STM32", sdk: "arm-none-eabi + libopencm3" },
                { v: "rp2040", label: "RP2040 / RP2350", sdk: "pico-sdk" },
                { v: "native", label: "Native / Host", sdk: "No MCU" },
              ] as const
            ).map((opt) => {
              const sel = state.firmware_target === opt.v;
              return (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => patch({ firmware_target: opt.v })}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    sel
                      ? "border-accent-green bg-accent-green/10"
                      : "border-border-glass bg-surface-bg hover:bg-surface-hover"
                  }`}
                >
                  <div className="text-sm font-semibold text-text-primary">
                    {opt.label}
                  </div>
                  <div className="text-xs text-text-muted">{opt.sdk}</div>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Template cloned into <code>firmware/</code>: CMake presets, HAL
            abstraction, unit test runner. Switch or remove manually later.
          </p>
        </div>
      )}
    </div>
  );
}

function StepReview({
  state,
  result,
  onOpenDeliverables,
}: {
  state: WizardState;
  result: { slug: string; repo: string; deliverables: string[] };
  onOpenDeliverables: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-accent-green/30 bg-accent-green/5 p-4">
        <h3 className="mb-2 text-sm font-semibold text-accent-green">
          Project created
        </h3>
        <p className="text-sm text-text-primary">{state.name}</p>
        <a
          href={result.repo}
          target="_blank"
          rel="noopener"
          className="mt-2 inline-flex items-center gap-1 text-sm text-accent-green hover:underline"
        >
          {result.repo} <ExternalLink size={12} />
        </a>
      </div>

      <div>
        <h4 className="mb-2 text-xs uppercase tracking-wider text-text-muted">
          Deliverables created
        </h4>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {result.deliverables.map((d) => (
            <li
              key={d}
              className="rounded-lg border border-border-glass bg-surface-bg px-3 py-2 text-sm font-mono text-text-primary"
            >
              {d}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onOpenDeliverables}
          className="rounded-lg bg-accent-green/20 px-4 py-2 text-sm text-accent-green hover:bg-accent-green/30"
        >
          Open workflow list
        </button>
      </div>
    </div>
  );
}
