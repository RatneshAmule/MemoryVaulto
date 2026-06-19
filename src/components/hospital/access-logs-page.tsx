'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, LogOut, Download, Activity, Building2, ScrollText } from 'lucide-react';
import { useAppStore, type AccessLogItem } from '@/stores/app-store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function AccessLogsPage() {
  const { currentUser, logout, setCurrentPage } = useAppStore();
  const [logs, setLogs] = useState<AccessLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const params = new URLSearchParams();
        if (currentUser?.role === 'patient' && currentUser.patient?.id) {
          params.set('patientId', currentUser.patient.id);
        }
        const res = await fetch(`/api/access-logs?${params}`);
        const data = await res.json();
        if (res.ok) setLogs(data.logs);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchLogs();
  }, [currentUser]);

  if (!currentUser) return null;

  const filteredLogs = filterType === 'all' ? logs : logs.filter((l) => l.accessType === filterType);

  const generateHash = (log: AccessLogItem) => {
    const str = `${log.id}${log.accessorId}${log.patientId}${log.timestamp}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
  };

  const handleExport = () => {
    const csv = [
      'Timestamp,Accessor,Patient,Type,Method,Reason,Hash',
      ...filteredLogs.map((log) =>
        `"${new Date(log.timestamp).toISOString()}","${log.accessor?.name || ''}","${log.patient?.user?.name || ''}","${log.accessType}","${log.accessMethod}","${log.reason || ''}","${generateHash(log)}"`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'access-logs.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export downloaded');
  };

  const typeColors: Record<string, string> = {
    emergency: 'bg-red-950/50 text-red-300 border-red-800/50',
    routine: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50',
    override: 'bg-amber-950/50 text-amber-300 border-amber-800/50',
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <nav className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">MemoryVault</span>
          <span className="text-xs text-slate-400 ml-2">Access Logs</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage('emergency')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <Activity className="w-3.5 h-3.5" /> Emergency
          </button>
          <button
            onClick={() => setCurrentPage('hospital')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" /> Command Center
          </button>
          <button
            onClick={() => setCurrentPage('access-logs')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-slate-700/50 text-white"
          >
            <ScrollText className="w-3.5 h-3.5" /> Logs
          </button>
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-300"
            onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white"
            onClick={() => { logout(); setCurrentPage('landing'); }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Access Logs</h1>
            <div className="flex gap-2">
              {['all', 'emergency', 'routine', 'override'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                    filterType === type
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No access logs found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{log.accessor?.name || 'Unknown'}</span>
                        <span className="text-xs text-slate-500">→</span>
                        <span className="text-sm text-slate-300">{log.patient?.user?.name || 'Unknown Patient'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[log.accessType] || typeColors.routine}`}>
                          {log.accessType}
                        </span>
                        <span className="text-xs text-slate-500">via {log.accessMethod}</span>
                      </div>
                      {log.reason && <p className="text-xs text-slate-400 mt-1">{log.reason}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                        {log.expiresAt && (
                          <span className="text-amber-400">
                            Expires: {new Date(log.expiresAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-600 font-mono">#{generateHash(log)}</span>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(() => {
                      try {
                        const viewed = JSON.parse(log.dataViewed);
                        return viewed.map((v: string) => (
                          <span key={v} className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{v}</span>
                        ));
                      } catch { return null; }
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
