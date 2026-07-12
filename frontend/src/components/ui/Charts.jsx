import {
  BarChart as RechartsBar,
  LineChart as RechartsLine,
  PieChart as RechartsPie,
  AreaChart as RechartsArea,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  Line,
  Pie,
  Area,
  Cell,
} from 'recharts';

const axisStyle = {
  fontSize: 12,
  tickLine: false,
};

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    fontSize: '12px',
  },
};

const defaultGrid = {
  strokeDasharray: '3 3',
  stroke: '#e5e7eb',
  vertical: false,
};

export function BarChart({
  data = [],
  xKey = 'name',
  yKey = 'value',
  color = '#3b82f6',
  height = 300,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBar data={data}>
        <CartesianGrid {...defaultGrid} />
        <XAxis dataKey={xKey} {...axisStyle} />
        <YAxis {...axisStyle} />
        <Tooltip {...tooltipStyle} />
        <Legend />
        <Bar dataKey={yKey} fill={color} radius={[6, 6, 0, 0]} />
      </RechartsBar>
    </ResponsiveContainer>
  );
}

export function LineChart({
  data = [],
  xKey = 'name',
  yKey = 'value',
  color = '#3b82f6',
  height = 300,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLine data={data}>
        <CartesianGrid {...defaultGrid} />
        <XAxis dataKey={xKey} {...axisStyle} />
        <YAxis {...axisStyle} />
        <Tooltip {...tooltipStyle} />
        <Legend />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </RechartsLine>
    </ResponsiveContainer>
  );
}

export function PieChart({
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  height = 300,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPie>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={50}
          paddingAngle={2}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend />
      </RechartsPie>
    </ResponsiveContainer>
  );
}

export function AreaChart({
  data = [],
  xKey = 'name',
  yKey = 'value',
  color = '#3b82f6',
  height = 300,
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsArea data={data}>
        <CartesianGrid {...defaultGrid} />
        <XAxis dataKey={xKey} {...axisStyle} />
        <YAxis {...axisStyle} />
        <Tooltip {...tooltipStyle} />
        <Legend />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke={color}
          fill={color}
          fillOpacity={0.1}
          strokeWidth={2}
        />
      </RechartsArea>
    </ResponsiveContainer>
  );
}
