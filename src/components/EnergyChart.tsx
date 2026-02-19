import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '06:00', yield: 0 },
  { time: '08:00', yield: 120 },
  { time: '10:00', yield: 450 },
  { time: '12:00', yield: 890 },
  { time: '14:00', yield: 780 },
  { time: '16:00', yield: 320 },
  { time: '18:00', yield: 40 },
  { time: '20:00', yield: 0 },
];

export const EnergyChart = () => {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }}
            unit="W"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
            }}
          />
          <Area 
            type="monotone" 
            dataKey="yield" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorYield)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
