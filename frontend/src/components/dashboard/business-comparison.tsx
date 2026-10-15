import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { BusinessComparison as BusinessComparisonData } from "@/lib/financial-types";
import { formatCurrency, formatPercent } from "@/lib/financial-utils";

interface BusinessComparisonProps {
  data: BusinessComparisonData | null;
  loading?: boolean;
}

const metrics = [
  { key: "income", label: "Ingresos" },
  { key: "outcome", label: "Egresos" },
  { key: "net", label: "Beneficio neto" },
] as const;

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

interface ComparisonTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

function ComparisonTooltip({ active, payload, label }: ComparisonTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-lg">
      <p className="mb-2 font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 py-0.5">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="ml-auto pl-4 font-medium text-foreground">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function formatDifference(value: number, percent = false) {
  if (value === 0) return percent ? formatPercent(0) : formatCurrency(0);
  const sign = value > 0 ? "+" : "−";
  const formatted = percent
    ? formatPercent(Math.abs(value))
    : formatCurrency(Math.abs(value));
  return `${sign}${formatted}`;
}

export function BusinessComparison({ data, loading = false }: BusinessComparisonProps) {
  if (loading) {
    return (
      <Card className="border-border/60">
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="mt-1 h-3 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-[280px] w-full rounded-lg" />
          <Skeleton className="h-[220px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const chartData = metrics.map(({ key, label }) => ({
    metric: label,
    B2B: data?.B2B[key] ?? 0,
    B2C: data?.B2C[key] ?? 0,
  }));
  const hasData = data
    ? [data.B2B.income, data.B2B.outcome, data.B2C.income, data.B2C.outcome].some(
        (value) => value !== 0,
      )
    : false;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">
          Comparativa B2B vs B2C
        </CardTitle>
        <CardDescription>
          Ingresos, egresos y beneficio neto por segmento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasData ? (
          <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
            No hay datos para comparar en el rango seleccionado.
          </div>
        ) : (
          <div role="img" aria-label="Gráfico de barras verticales de ingresos, egresos y beneficio neto para B2B y B2C">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid
                  stroke="var(--color-border)"
                  strokeDasharray="3 3"
                  strokeOpacity={0.6}
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="metric"
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                  tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                  tickLine={false}
                  width={52}
                />
                <Tooltip content={<ComparisonTooltip />} />
                <Legend />
                <Bar dataKey="B2B" fill="var(--chart-income)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="B2C" fill="var(--chart-outcome)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {data ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[620px] text-left text-sm">
              <caption className="sr-only">
                Tabla comparativa de ingresos, egresos, beneficio neto y margen por segmento
              </caption>
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Métrica</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">B2B</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">B2C</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Diferencia (B2C − B2B)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {metrics.map(({ key, label }) => {
                  const difference = data.B2C[key] - data.B2B[key];
                  return (
                    <tr key={key}>
                      <th scope="row" className="px-4 py-3 font-medium text-foreground">
                        {label}
                      </th>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(data.B2B[key])}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(data.B2C[key])}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatDifference(difference)}</td>
                    </tr>
                  );
                })}
                <tr>
                  <th scope="row" className="px-4 py-3 font-medium text-foreground">
                    Margen de beneficio
                  </th>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {data.B2B.income > 0 ? formatPercent(data.B2B.profitPercent) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {data.B2C.income > 0 ? formatPercent(data.B2C.profitPercent) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {data.B2B.income > 0 && data.B2C.income > 0
                      ? formatDifference(data.B2C.profitPercent - data.B2B.profitPercent, true)
                      : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
