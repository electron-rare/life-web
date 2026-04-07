import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import ReactMarkdown from "react-markdown";

export function GooseRecipes() {
  const [runningRecipe, setRunningRecipe] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{ step: string; status: string; response?: string; error?: string }>>([]);
  const [recipeVars, setRecipeVars] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["goose-recipes"],
    queryFn: api.goose.recipes,
  });

  const runMutation = useMutation({
    mutationFn: ({ name, variables }: { name: string; variables?: Record<string, string> }) =>
      api.goose.runRecipe(name, ".", variables),
    onMutate: ({ name }) => { setRunningRecipe(name); setResults([]); },
    onSuccess: (data) => { setResults(data.results); setRunningRecipe(null); },
    onError: () => { setRunningRecipe(null); },
  });

  if (isLoading) return <div className="text-text-muted text-sm p-4">Loading recipes...</div>;

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-text-primary font-mono text-sm">Recipes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(data?.recipes ?? []).map((recipe) => (
          <div key={recipe.name} className="glass-card rounded-xl p-4 border border-border-glass">
            <div className="flex items-center justify-between mb-2">
              <span className="text-accent-blue font-mono text-sm">{recipe.name}</span>
              <span className="text-text-dim text-xs">{recipe.steps} steps</span>
            </div>
            <p className="text-text-muted text-xs mb-3">{recipe.description}</p>
            {recipe.variables && recipe.variables.length > 0 && (
              <div className="space-y-1 mb-2">
                {recipe.variables.map((v: string) => (
                  <input
                    key={v}
                    placeholder={v}
                    value={recipeVars[`${recipe.name}:${v}`] || ""}
                    onChange={(e) =>
                      setRecipeVars((prev) => ({
                        ...prev,
                        [`${recipe.name}:${v}`]: e.target.value,
                      }))
                    }
                    className="w-full bg-surface-bg text-text-primary border border-border-glass rounded px-2 py-1 text-xs font-mono placeholder:text-text-dim focus:border-accent-green/50 focus:outline-none"
                  />
                ))}
              </div>
            )}
            <button
              onClick={() => {
                const vars: Record<string, string> = {};
                if (recipe.variables) {
                  for (const v of recipe.variables) {
                    const val = recipeVars[`${recipe.name}:${v}`];
                    if (val) vars[v] = val;
                  }
                }
                runMutation.mutate({
                  name: recipe.name,
                  variables: Object.keys(vars).length > 0 ? vars : undefined,
                });
              }}
              disabled={runningRecipe !== null}
              className="w-full px-3 py-1.5 text-xs font-mono rounded border transition-colors disabled:opacity-30 border-accent-green/30 text-accent-green hover:bg-accent-green/10"
            >
              {runningRecipe === recipe.name ? "Running..." : "Run"}
            </button>
          </div>
        ))}
      </div>
      {results.length > 0 && (
        <div className="terminal-box rounded-xl p-4 space-y-3">
          <h4 className="text-text-primary font-mono text-sm">Results</h4>
          {results.map((r, i) => (
            <div key={i} className="border-t border-border-glass pt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-mono ${r.status === "ok" ? "text-accent-green" : "text-accent-red"}`}>[{r.status}]</span>
                <span className="text-text-primary text-xs font-mono">{r.step}</span>
              </div>
              {r.response && (
                <div className="text-text-muted text-xs ml-4 prose prose-invert prose-xs prose-p:my-0.5 prose-pre:bg-surface-bg prose-code:text-accent-green">
                  <ReactMarkdown>{r.response}</ReactMarkdown>
                </div>
              )}
              {r.error && <p className="text-accent-red text-xs ml-4">{r.error}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
