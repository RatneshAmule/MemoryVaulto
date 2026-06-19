'use client';

import { useEffect, useState } from 'react';
import { History, Shield, QrCode, Search, BadgeCheck } from 'lucide-react';
import { useAppStore, type AccessLogItem } from '@/stores/app-store';

const methodIcons: Record<string, React.ReactNode> = {
  qr: <QrCode className="w-3.5 h-3.5" />,
  biometric: <Shield className="w-3.5 h-3.5" />,
  facial: <Shield className="w-3.5 h-3.5" />,
  badge: <BadgeCheck className="w-3.5 h-3.5" />,
  search: <Search className="w-3.5 h-3.5" />,
};

const typeColors: Record<string, string> = {
  emergency: 'bg-red-950/50 text-red-300 border-red-800/50',
  routine: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50',
  override: 'bg-amber-950/50 text-amber-300 border-amber-800/50',
};

export function AccessLogsSection() {
  const { currentPatient } = useAppStore();
  const [logs, setLogs] = useState<AccessLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentPatient) return;
    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/access-logs?patientId=${currentPatient.id}`);
        const data = await res.json();
        if (res.ok) setLogs(data.logs);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchLogs();
  }, [currentPatient]);

  if (!currentPatient) return null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Access Logs</h2>
        <p className="text-slate-400 text-sm mt-1">See who has accessed your medical vault and why</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No access logs yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                    {methodIcons[log.accessMethod] || <Shield className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{log.accessor?.name || 'Unknown'}</span>
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
    </div>
  );
}
