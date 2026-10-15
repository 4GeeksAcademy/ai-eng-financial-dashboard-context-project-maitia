import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

const IncomeOutcomeChart = lazy(() =>
  import("@/components/dashboard/income-outcome-chart").then((module) => ({
    default: module.IncomeOutcomeChart,
  })),
);
const ProfitPercentChart = lazy(() =>
  import("@/components/dashboard/profit-percent-chart").then((module) => ({
    default: module.ProfitPercentChart,
  })),
);
const BusinessComparison = lazy(() =>
  import("@/components/dashboard/business-comparison").then((module) => ({
    default: module.BusinessComparison,
  })),
);

function ChartFallback({ comparison = false }: { comparison?: boolean }) {
  return (
    <Card className="border-border/60" aria-busy="true">
      <CardHeader className="pb-4">
        <Skeleton className="h-5 w-52" />
        <Skeleton className="mt-1 h-3 w-64" />
      </CardHeader>
      <CardContent className={comparison ? "space-y-6" : undefined}>
        <Skeleton className="h-[280px] w-full rounded-lg" />
        {comparison ? <Skeleton className="h-[220px] w-full rounded-lg" /> : null}
      </CardContent>
    </Card>
  );
}

function useNearViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isNearViewport, setIsNearViewport] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || isNearViewport) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isNearViewport]);

  return { ref, isNearViewport };
}

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
  const {
    ref: comparisonSectionRef,
    isNearViewport: isComparisonNearViewport,
  } = useNearViewport<HTMLElement>();

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
            <Suspense fallback={<ChartFallback />}>
              <IncomeOutcomeChart data={monthlyData} loading={loading} />
            </Suspense>
            <Suspense fallback={<ChartFallback />}>
              <ProfitPercentChart data={monthlyData} loading={loading} />
            </Suspense>
          </section>

          <section
            ref={comparisonSectionRef}
            aria-label="B2B and B2C comparison"
          >
            {isComparisonNearViewport ? (
              <Suspense fallback={<ChartFallback comparison />}>
                <BusinessComparison
                  data={businessComparison}
                  loading={loading}
                />
              </Suspense>
            ) : (
              <ChartFallback comparison />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
