import { useEffect, useState, type FormEvent } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChart } from "@/components/dashboard/income-outcome-chart";
import { ProfitPercentChart } from "@/components/dashboard/profit-percent-chart";
import { BusinessComparison } from "@/components/dashboard/business-comparison";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import {
  computeBusinessComparison,
  computeKPIs,
  computeMonthlyData,
} from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchFinancialData(
  startDate: string,
  endDate: string,
): Promise<FinancialMovement[]> {
  const query = new URLSearchParams();
  if (startDate) query.set("start_date", startDate);
  if (endDate) query.set("end_date", endDate);
  const queryString = query.toString();
  const url = `${API_BASE_URL}/api/metrics${queryString ? `?${queryString}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

function App() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [businessComparison, setBusinessComparison] = useState<ReturnType<typeof computeBusinessComparison> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedRange, setAppliedRange] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    let isCurrentRequest = true;
    setLoading(true);
    setError(null);

    fetchFinancialData(appliedRange.startDate, appliedRange.endDate)
      .then((movements) => {
        if (!isCurrentRequest) return;
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
        setBusinessComparison(computeBusinessComparison(movements));
      })
      .catch(() => {
        if (!isCurrentRequest) return;
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false);
      });
    return () => {
      isCurrentRequest = false;
    };
  }, [appliedRange]);

  function applyDateRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedRange({ startDate, endDate });
  }

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div role="status" aria-live="polite" className="sr-only">
        {error
          ? ""
          : loading
            ? "Cargando datos financieros."
            : "Datos financieros actualizados."}
      </div>

      <div
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        aria-busy={loading}
      >
        <div className="flex flex-col gap-8">
          <DashboardHeader period="2024 - Full Year" />

          <form
            className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-end"
            onSubmit={applyDateRange}
          >
            <label className="flex flex-col gap-1 text-sm">
              Fecha inicial
              <input
                aria-label="Fecha inicial"
                className="rounded-md border border-border bg-background px-3 py-2"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Fecha final
              <input
                aria-label="Fecha final"
                className="rounded-md border border-border bg-background px-3 py-2"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              type="submit"
            >
              Aplicar fechas
            </button>
            <p className="text-sm text-muted-foreground">
              Deja ambas fechas vacías para mostrar todos los datos.
            </p>
          </form>

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
            >
              {error}
            </div>
          ) : null}

          <section aria-label="Key performance indicators">
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <IncomeOutcomeChart data={monthlyData} loading={loading} />
            <ProfitPercentChart data={monthlyData} loading={loading} />
          </section>

          <section aria-label="B2B and B2C comparison">
            <BusinessComparison data={businessComparison} loading={loading} />
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
