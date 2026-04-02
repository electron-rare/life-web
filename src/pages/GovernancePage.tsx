import { GovernanceDashboard } from "../components/governance/GovernanceDashboard";

export function GovernancePage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 px-4">
          Governance Dashboard
        </h1>
        <GovernanceDashboard />
      </div>
    </main>
  );
}
