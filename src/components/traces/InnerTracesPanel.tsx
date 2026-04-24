import { useInnerTraces } from "./useInnerTraces";

interface Props {
  apiBase: string;
}

export function InnerTracesPanel({ apiBase }: Props) {
  const { rows, error } = useInnerTraces(apiBase, 20);

  if (error) {
    return <div role="alert">Failed to load traces: {error}</div>;
  }
  return (
    <table aria-label="inner-traces">
      <thead>
        <tr>
          <th>Model</th>
          <th>Tokens in</th>
          <th>Tokens out</th>
          <th>Cost (USD)</th>
          <th>Status</th>
          <th>Started</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{r.llm_model}</td>
            <td>{r.tokens_in}</td>
            <td>{r.tokens_out}</td>
            <td>{r.cost_usd.toFixed(4)}</td>
            <td>{r.status}</td>
            <td>{r.started_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
