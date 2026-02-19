import React from 'react';
import { LayoutDashboard, ShoppingBag, Wallet, Leaf, Bell, User, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useUser } from '../context/UserContext';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon: Icon, label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left",
      active 
        ? "bg-emerald-50 text-emerald-700 font-medium" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}
  >
    <Icon size={20} />
    <span className="text-sm">{label}</span>
  </button>
);

export const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const { user, logout } = useUser();

  return (
    <aside className="w-64 border-r border-slate-200 h-screen sticky top-0 bg-white flex flex-col p-6">
      <div className="flex items-center gap-2 mb-10 px-2">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
          <Leaf className="text-white" size={18} />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900 font-display">Helios</span>
      </div>

      <nav className="flex-1 space-y-1">
        <NavItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
        />
        <NavItem 
          icon={ShoppingBag} 
          label="Marketplace" 
          active={activeTab === 'marketplace'} 
          onClick={() => setActiveTab('marketplace')} 
        />
        <NavItem 
          icon={Wallet} 
          label="Portfolio" 
          active={activeTab === 'portfolio'} 
          onClick={() => setActiveTab('portfolio')} 
        />
      </nav>

      <div className="pt-6 border-t border-slate-100 space-y-1">
        <div className="px-4 py-3 mb-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account</p>
          <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
          <p className="text-[10px] text-emerald-600 font-bold">Balance: ${user?.balance.toFixed(2)}</p>
        </div>
        <NavItem icon={Bell} label="Notifications" onClick={() => {}} />
        <NavItem icon={User} label="Profile" onClick={() => {}} />
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left text-red-500 hover:bg-red-50"
        >
          <LogOut size={20} />
          <span className="text-sm">Log Out</span>
        </button>
      </div>
    </aside>
  );
};
