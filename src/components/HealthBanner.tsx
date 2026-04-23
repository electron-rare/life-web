import React from 'react';

type Props = {
  routerStatus: Record<string, boolean>;
  gpu: { error?: string };
  containerStates: Record<string, number>;
  ragVectorCount: number;
};

export function HealthBanner({
  routerStatus,
  gpu,
  containerStates,
  ragVectorCount,
}: Props) {
  const routerBad = Object.entries(routerStatus).filter(([, ok]) => !ok);
  const gpuBad = !!gpu?.error;
  const containersBad = (containerStates['unknown'] ?? 0) > 0;

  const badges: string[] = [];
  if (routerBad.length > 0) {
    badges.push(
      ...routerBad.map(([name]) => `router unhealthy: ${name}`),
    );
  }
  if (gpuBad) badges.push(`gpu: ${gpu.error}`);
  if (containersBad) {
    badges.push(`containers: ${containerStates['unknown']} unknown`);
  }

  const hasErrors = routerBad.length > 0 || gpuBad;
  const hasWarnings = !hasErrors && (containersBad || ragVectorCount === 0);
  const tone = hasErrors ? 'red' : hasWarnings ? 'orange' : 'green';
  const title = hasErrors
    ? 'Degraded: see details'
    : hasWarnings
      ? 'Degraded: minor issues'
      : 'All systems operational';

  return (
    <div
      data-tone={tone}
      className={`rounded p-3 ${
        tone === 'green' ? 'bg-green-900 text-green-100'
        : tone === 'orange' ? 'bg-orange-900 text-orange-100'
        : 'bg-red-900 text-red-100'
      }`}
    >
      <strong>{title}</strong>
      {badges.length > 0 && (
        <ul className="mt-1 list-disc pl-5 text-sm">
          {badges.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
