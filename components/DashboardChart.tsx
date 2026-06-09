"use client";

import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeightData {
  data_medicao: string;
  peso_kg: number;
}

export function DashboardChart({ data }: { data: WeightData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[110px] items-center justify-center text-[11px] font-medium" style={{ color: "#555" }}>
        Nenhum registro de peso no período.
      </div>
    );
  }

  const recentData = [...data].slice(0, 7).reverse();
  const chartData = recentData.map(item => {
    const date = new Date(item.data_medicao);
    return { name: `${date.getDate()}/${date.getMonth() + 1}`, peso: item.peso_kg };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="px-3 py-2 rounded-xl"
          style={{ background: "#222", border: "1px solid #333" }}
        >
          <p className="text-[10px] font-medium mb-0.5" style={{ color: "#777" }}>{label}</p>
          <p className="text-sm font-bold text-white">
            {payload[0].value} <span className="font-medium" style={{ color: "#777" }}>kg</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, index, data } = props;
    if (index === data.length - 1) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={8} fill="#ff6500" fillOpacity={0.2} />
          <circle cx={cx} cy={cy} r={4} fill="#ff6500" stroke="#1a1a1a" strokeWidth={1.5} />
        </g>
      );
    }
    return null;
  };

  return (
    <div className="h-[110px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
          <defs>
            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff6500" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ff6500" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#444', fontWeight: 500 }}
            dy={8}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="peso"
            stroke="#ff6500"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorWeight)"
            dot={<CustomDot data={chartData} />}
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
