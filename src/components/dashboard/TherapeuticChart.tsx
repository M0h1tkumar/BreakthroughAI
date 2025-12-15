import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Activity } from "lucide-react";

const data = [
  { name: "Oncology", queries: 342, color: "hsl(168, 76%, 36%)" },
  { name: "Neurology", queries: 256, color: "hsl(199, 89%, 48%)" },
  { name: "Cardiology", queries: 198, color: "hsl(262, 83%, 58%)" },
  { name: "Immunology", queries: 167, color: "hsl(43, 96%, 56%)" },
  { name: "Rare Disease", queries: 134, color: "hsl(339, 90%, 51%)" },
];

export function TherapeuticChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center gap-2">
        <Activity className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Top Therapeutic Areas</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              width={90}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-lg)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [`${value} queries`, "Total"]}
            />
            <Bar dataKey="queries" radius={[0, 6, 6, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
