import { motion } from 'motion/react';
import { MapPin, Zap, Users, ArrowRight, Loader2 } from 'lucide-react';
import { SolarProject } from '../types';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';

const ProjectCard = ({ project, onInvest }: { project: SolarProject, onInvest: (id: string) => void }) => {
  const progress = ((project.totalShares - project.availableShares) / project.totalShares) * 100;
  const [investing, setInvesting] = useState(false);

  const handleInvest = async () => {
    setInvesting(true);
    await onInvest(project.id);
    setInvesting(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={project.image} 
          alt={project.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
            project.status === 'funding' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
          )}>
            {project.status}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-slate-900">{project.name}</h3>
          <span className="text-emerald-600 font-bold">{project.expectedYield}% <span className="text-[10px] text-slate-400 uppercase">Yield</span></span>
        </div>
        
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
          <MapPin size={14} />
          <span>{project.location}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{project.capacity}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{project.totalShares.toLocaleString()} Shares</span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-slate-500">Funding Progress</span>
            <span className="text-slate-900">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Price per share</p>
            <p className="text-lg font-bold text-slate-900">${project.pricePerShare}</p>
          </div>
          <button 
            onClick={handleInvest}
            disabled={investing || project.availableShares === 0}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {investing ? <Loader2 className="animate-spin" size={16} /> : 'Invest Now'}
            {!investing && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Marketplace = () => {
  const [projects, setProjects] = useState<SolarProject[]>([]);
  const { user, login } = useUser();

  const fetchProjects = () => {
    fetch('/api/projects').then(res => res.json()).then(setProjects);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleInvest = async (projectId: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/invest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, projectId, shares: 1 }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        login(updatedUser);
        fetchProjects();
        alert('Investment successful!');
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e) {
      alert('Failed to invest');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-display">Marketplace</h1>
          <p className="text-slate-500 mt-1">Discover and invest in verified solar projects worldwide.</p>
        </div>
        <div className="flex gap-2">
          {['All', 'Utility', 'Commercial', 'Residential'].map((filter) => (
            <button 
              key={filter}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                filter === 'All' ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onInvest={handleInvest} />
        ))}
      </div>
    </motion.div>
  );
};
