import { motion } from 'motion/react';
import { Wallet, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUser } from '../context/UserContext';
import { useEffect, useState } from 'react';

export const Portfolio = () => {
  const { user } = useUser();
  const [investments, setInvestments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetch(`/api/user/${user.id}/investments`).then(res => res.json()).then(setInvestments);
      fetch(`/api/user/${user.id}/transactions`).then(res => res.json()).then(setTransactions);
    }
  }, [user]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-display">Your Portfolio</h1>
        <p className="text-slate-500 mt-1">Manage your shares and track your environmental impact.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Owned Assets</h2>
            <div className="space-y-4">
              {investments.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img 
                      src={inv.image} 
                      alt={inv.project_name} 
                      className="w-12 h-12 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{inv.project_name}</p>
                      <p className="text-xs text-slate-500">{inv.shares} Shares • {inv.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">${inv.amount.toFixed(2)}</p>
                    <p className="text-xs text-emerald-600 font-medium">+{inv.expected_yield}% Yield</p>
                  </div>
                </div>
              ))}
              {investments.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-8">You haven't invested in any projects yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <History size={20} className="text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900">Transaction History</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="text-left py-3 font-medium">Type</th>
                  <th className="text-left py-3 font-medium">Project</th>
                  <th className="text-left py-3 font-medium">Date</th>
                  <th className="text-right py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((tx, i) => (
                  <tr key={i} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          tx.amount < 0 ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {tx.amount < 0 ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                        </div>
                        <span className="font-medium text-slate-900 capitalize">{tx.type}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-600">{tx.project_name || '-'}</td>
                    <td className="py-4 text-slate-400">{new Date(tx.timestamp).toLocaleDateString()}</td>
                    <td className={cn(
                      "py-4 text-right font-semibold",
                      tx.amount < 0 ? "text-slate-900" : "text-emerald-600"
                    )}>
                      {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 opacity-60 mb-1">
                <Wallet size={16} />
                <span className="text-xs font-medium uppercase tracking-wider">Available Balance</span>
              </div>
              <h2 className="text-3xl font-bold mb-6">${user?.balance.toFixed(2)}</h2>
              <div className="flex gap-3">
                <button className="flex-1 bg-white text-slate-900 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors">
                  Deposit
                </button>
                <button className="flex-1 bg-slate-800 text-white py-2 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">
                  Withdraw
                </button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
          </div>

          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
            <h3 className="text-emerald-900 font-bold mb-2">ESG Impact Report</h3>
            <p className="text-emerald-700 text-sm mb-4">Your investments have prevented {(investments.reduce((s, i) => s + i.shares, 0) * 0.088).toFixed(2)} tons of CO2 emissions this year.</p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-600 font-medium">Progress to Annual Goal</span>
                <span className="text-emerald-900 font-bold">74%</span>
              </div>
              <div className="w-full h-2 bg-emerald-200/50 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '74%' }} />
              </div>
            </div>
            <button className="w-full mt-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors">
              Download Full Report
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
