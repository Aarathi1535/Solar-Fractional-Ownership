import { motion } from 'motion/react';
import { TrendingUp, Zap, Globe, DollarSign } from 'lucide-react';
import { EnergyChart } from './EnergyChart';
import { cn } from '../lib/utils';
import { useUser } from '../context/UserContext';
import { useEffect, useState } from 'react';

const StatCard = ({ title, value, subValue, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-50 rounded-lg text-slate-600">
        <Icon size={20} />
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      <span className="text-slate-400 text-xs">{subValue}</span>
    </div>
  </div>
);

export const Dashboard = () => {
  const { user } = useUser();
  const [investments, setInvestments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetch(`/api/user/${user.id}/investments`).then(res => res.json()).then(setInvestments);
      fetch(`/api/user/${user.id}/transactions`).then(res => res.json()).then(setTransactions);
    }
  }, [user]);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalShares = investments.reduce((sum, inv) => sum + inv.shares, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-display">Welcome back, {user?.name.split(' ')[0]}</h1>
        <p className="text-slate-500 mt-1">Your solar portfolio is performing 12% above average today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Invested" 
          value={`$${totalInvested.toFixed(2)}`} 
          subValue={`${totalShares} Shares`} 
          icon={DollarSign} 
        />
        <StatCard 
          title="Total Yield" 
          value={`${(totalShares * 124).toFixed(1)} kWh`} 
          subValue={`+${(totalShares * 1.2).toFixed(1)} kWh today`} 
          icon={Zap} 
          trend="+5.2%"
        />
        <StatCard 
          title="Earnings" 
          value={`$${(totalInvested * 0.06).toFixed(2)}`} 
          subValue="Paid monthly" 
          icon={TrendingUp} 
          trend="+8.1%"
        />
        <StatCard 
          title="CO2 Offset" 
          value={`${(totalShares * 0.088).toFixed(2)} Tons`} 
          subValue={`Equivalent to ${Math.round(totalShares * 1.5)} trees`} 
          icon={Globe} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Real-time Energy Yield</h2>
            <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 text-slate-600 focus:ring-0">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <EnergyChart />
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {transactions.slice(0, 5).map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.type === 'purchase' ? `Bought ${item.project_name}` : item.type}</p>
                  <p className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
                <span className={cn(
                  "text-sm font-semibold",
                  item.amount > 0 ? "text-emerald-600" : "text-slate-900"
                )}>
                  {item.amount > 0 ? `+$${item.amount.toFixed(2)}` : `-$${Math.abs(item.amount).toFixed(2)}`}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No recent activity</p>
            )}
          </div>
          <button className="w-full mt-8 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            View all transactions
          </button>
        </div>
      </div>
    </motion.div>
  );
};
