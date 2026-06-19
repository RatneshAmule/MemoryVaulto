'use client';

import { motion } from 'framer-motion';
import {
  Ambulance,
  Activity,
  Droplets,
  AlertTriangle,
  Building2,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useVaultStore } from './vault-store';

const criticalityConfig = {
  critical: { color: 'bg-red-500', text: 'text-red-400', label: 'CRITICAL', border: 'border-red-800/50' },
  urgent: { color: 'bg-amber-500', text: 'text-amber-400', label: 'URGENT', border: 'border-amber-800/50' },
  stable: { color: 'bg-emerald-500', text: 'text-emerald-400', label: 'STABLE', border: 'border-emerald-800/50' },
};

const statusConfig = {
  'en-route': { label: 'En Route', icon: Ambulance },
  'in-triage': { label: 'In Triage', icon: Clock },
  'in-treatment': { label: 'In Treatment', icon: Activity },
};

export function HospitalDashboard() {
  const { hospitalPatients } = useVaultStore();

  return (
    <div className="space-y-5">
      {/* Analytics bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Patients Today', value: '47', color: 'text-white' },
          { label: 'Critical', value: '8', color: 'text-red-400' },
          { label: 'Avg Response', value: '4.2s', color: 'text-emerald-400' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-3 text-center">
              <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Patient cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {hospitalPatients.map((patient, i) => {
          const crit = criticalityConfig[patient.criticality];
          const status = statusConfig[patient.status];
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
            >
              <Card className={`bg-slate-800/60 border ${crit.border}`}>
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold text-sm">{patient.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-[10px] px-1.5 py-0 ${crit.color} bg-transparent border border-current`}>
                          {crit.label}
                        </Badge>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">ETA</div>
                      <div className="text-sm text-white font-medium">{patient.eta}</div>
                    </div>
                  </div>

                  {/* Key info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs text-slate-400">{patient.bloodType}</span>
                      {patient.allergies.length > 0 && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-xs text-amber-400">
                            {patient.allergies.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {patient.conditions.map((cond) => (
                        <Badge
                          key={cond}
                          variant="secondary"
                          className="text-[10px] bg-slate-700 text-slate-300 py-0"
                        >
                          {cond}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {patient.flags.map((flag) => (
                        <span
                          key={flag}
                          className="text-[10px] text-slate-400 bg-slate-900/50 px-1.5 py-0.5 rounded"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Resource status */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 font-semibold text-sm uppercase tracking-wide">
              Resource Status
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'Cath Lab', status: 'Available', color: 'text-emerald-400' },
              { name: 'OR 3', status: 'Prepping', color: 'text-amber-400' },
              { name: 'Neuro', status: 'On-Call', color: 'text-slate-400' },
            ].map((resource) => (
              <div key={resource.name} className="text-center p-2 rounded bg-slate-900/40">
                <div className="text-xs text-slate-500">{resource.name}</div>
                <div className={`text-sm font-medium ${resource.color} mt-0.5`}>
                  {resource.status}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
