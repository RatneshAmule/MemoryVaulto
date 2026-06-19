'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Brain,
  Clock,
  Phone,
  Activity,
  Shield,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useVaultStore } from './vault-store';

const AI_RECOMMENDATIONS = [
  { text: 'Initiate STEMI protocol immediately', type: 'critical' as const },
  { text: 'Avoid NSAIDs — patient on Warfarin', type: 'warning' as const },
  { text: 'Golden window: countdown active', type: 'timer' as const },
  { text: 'Pre-notify cardiology — cath lab standby', type: 'info' as const },
  { text: 'Auto-notified: Daughter Sarah Wilson', type: 'success' as const },
];

const DRUG_CHECKS = [
  { drug: 'Heparin', safe: true },
  { drug: 'Nitroglycerin', safe: true },
  { drug: 'Ibuprofen', safe: false, reason: 'NSAID — Warfarin interaction: hemorrhage risk' },
  { drug: 'Metoprolol', safe: true, note: 'Already prescribed — continue current dose' },
  { drug: 'Clopidogrel', safe: true },
];

const COMORBIDITIES = [
  { name: 'Diabetes', x: 18, y: 35 },
  { name: 'Hypertension', x: 52, y: 18 },
  { name: 'A-Fib', x: 82, y: 35 },
  { name: 'Obesity', x: 50, y: 68 },
  { name: 'Prior MI', x: 30, y: 62 },
];

const CONNECTIONS = [
  [0, 1],
  [1, 2],
  [0, 3],
  [1, 3],
  [2, 4],
  [3, 4],
  [0, 4],
];

const iconMap = {
  critical: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
  timer: <Clock className="w-4 h-4 text-red-400 shrink-0 countdown-pulse" />,
  info: <Activity className="w-4 h-4 text-slate-400 shrink-0" />,
  success: <Phone className="w-4 h-4 text-emerald-400 shrink-0" />,
};

const textMap = {
  critical: 'text-red-400',
  warning: 'text-amber-400',
  timer: 'text-red-400',
  info: 'text-slate-300',
  success: 'text-emerald-400',
};

const bgMap = {
  critical: 'bg-red-950/30 border border-red-800/30',
  warning: 'bg-amber-950/20 border border-amber-800/20',
  timer: 'bg-red-950/30 border border-red-800/30',
  info: 'bg-slate-900/40',
  success: 'bg-emerald-950/20 border border-emerald-800/20',
};

export function AIIntelligence() {
  const { aiPatient: patient } = useVaultStore();
  const [riskScore, setRiskScore] = useState(0);
  const [countdown, setCountdown] = useState(38 * 60); // 38 minutes in seconds
  const [showRecommendations, setShowRecommendations] = useState(false);
  const prevCountRef = useRef(38 * 60);

  // Animate risk score
  useEffect(() => {
    const timer = setTimeout(() => setRiskScore(87), 500);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Stagger recommendations
  useEffect(() => {
    const timer = setTimeout(() => setShowRecommendations(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const countdownStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Risk level color
  const riskColor = riskScore >= 80 ? 'text-red-500' : riskScore >= 50 ? 'text-amber-500' : 'text-emerald-500';
  const riskLabel = riskScore >= 80 ? 'CRITICAL' : riskScore >= 50 ? 'ELEVATED' : 'LOW';
  const riskBarColor = riskScore >= 80 ? '[&>div]:bg-red-500' : riskScore >= 50 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500';

  return (
    <div className="space-y-5">
      {/* Patient + Risk Score */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Patient card */}
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-semibold text-sm">
                JW
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">{patient.name}</h4>
                <p className="text-slate-400 text-xs">
                  {patient.age} yrs, {patient.gender} — {patient.bloodType}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {patient.conditions.map((cond) => (
                <Badge
                  key={cond}
                  variant="secondary"
                  className="text-[10px] bg-slate-700 text-slate-300"
                >
                  {cond}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk score */}
        <Card className="bg-red-950/30 border-red-800/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-semibold text-sm uppercase tracking-wide">
                Cardiac Event Risk
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className={`text-4xl font-bold ${riskColor}`}>
                {riskScore}%
              </span>
              <span className={`text-xs font-semibold ${riskColor} mb-1`}>
                {riskLabel}
              </span>
            </div>
            <Progress value={riskScore} className={`mt-3 h-2 bg-slate-800 ${riskBarColor}`} />
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-semibold text-sm uppercase tracking-wide">
                AI Recommendations
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-800">
              Live Analysis
            </Badge>
          </div>
          <div className="space-y-2.5">
            {AI_RECOMMENDATIONS.map((rec, i) => (
              <motion.div
                key={rec.text}
                initial={showRecommendations ? { opacity: 0, x: -10 } : false}
                animate={showRecommendations ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.3 }}
                className={`flex items-start gap-3 p-2.5 rounded-lg ${bgMap[rec.type]}`}
              >
                {rec.type === 'timer' ? (
                  <Clock className="w-4 h-4 text-red-400 shrink-0 countdown-pulse" />
                ) : (
                  iconMap[rec.type]
                )}
                <span className={`text-sm ${textMap[rec.type]}`}>
                  {rec.type === 'timer'
                    ? `Golden window: ${countdownStr} remaining`
                    : rec.text}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drug interaction checker */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300 font-semibold text-sm uppercase tracking-wide">
              Drug Interaction Check
            </span>
          </div>
          <div className="space-y-2">
            {DRUG_CHECKS.map((check, i) => (
              <motion.div
                key={check.drug}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.08 }}
                className={`flex items-center justify-between p-2.5 rounded-lg ${
                  check.safe ? 'bg-slate-900/40' : 'bg-red-950/30 border border-red-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  {check.safe ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${check.safe ? 'text-slate-300' : 'text-red-400'}`}>
                    {check.drug}
                  </span>
                </div>
                <span className="text-xs text-slate-500 max-w-[180px] text-right">
                  {check.safe
                    ? check.note || 'Safe to administer'
                    : check.reason}
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comorbidity map */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 font-semibold text-sm uppercase tracking-wide">
              Comorbidity Interaction Map
            </span>
          </div>
          <div className="relative h-44 bg-slate-900/40 rounded-lg overflow-hidden">
            {/* Connection lines - SVG */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80" preserveAspectRatio="none">
              {CONNECTIONS.map(([from, to], i) => {
                const a = COMORBIDITIES[from];
                const b = COMORBIDITIES[to];
                return (
                  <motion.line
                    key={i}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="#dc2626"
                    strokeWidth="0.3"
                    strokeOpacity="0.35"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ delay: 1 + i * 0.12, duration: 0.5 }}
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {COMORBIDITIES.map((node, i) => (
              <motion.div
                key={node.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.1, duration: 0.3, type: 'spring', stiffness: 200 }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-red-600/15 border border-red-600/30 flex items-center justify-center hover:bg-red-600/25 transition-colors cursor-default">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 whitespace-nowrap font-medium">
                    {node.name}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Legend */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 text-[9px] text-slate-600">
              <div className="w-3 h-px bg-red-600/40" />
              <span>Interaction risk</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
