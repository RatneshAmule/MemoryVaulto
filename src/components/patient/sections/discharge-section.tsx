'use client';

import { useState, useEffect } from 'react';
import { Home, ShieldCheck, AlertTriangle, Brain, Activity, CheckCircle, XCircle } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { Badge } from '@/components/ui/badge';
import type { DischargeAssessmentItem } from '@/stores/app-store';

function SafetyScoreGauge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-emerald-400';
    if (s >= 60) return 'text-amber-400';
    if (s >= 40) return 'text-orange-400';
    return 'text-red-400';
  };
  const getBg = (s: number) => {
    if (s >= 80) return 'bg-emerald-950/30 border-emerald-800/50';
    if (s >= 60) return 'bg-amber-950/30 border-amber-800/50';
    if (s >= 40) return 'bg-orange-950/30 border-orange-800/50';
    return 'bg-red-950/30 border-red-800/50';
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border ${getBg(score)}`}>
      <div className={`text-3xl font-bold ${getColor(score)}`}>{score}</div>
      <div>
        <p className="text-sm font-medium text-slate-300">Discharge Safety Score</p>
        <p className="text-xs text-slate-500">
          {score >= 80 ? 'Safe for discharge' : score >= 60 ? 'Discharge with precautions' : score >= 40 ? 'Needs support before discharge' : 'High risk — do not discharge'}
        </p>
      </div>
    </div>
  );
}

function RiskMeter({ risk }: { risk: number | null | undefined }) {
  if (risk == null) return null;
  const pct = Math.round(risk * 100);
  const getColor = (r: number) => {
    if (r <= 0.2) return 'bg-emerald-500';
    if (r <= 0.4) return 'bg-amber-500';
    if (r <= 0.6) return 'bg-orange-500';
    return 'bg-red-500';
  };
  const getLabel = (r: number) => {
    if (r <= 0.2) return 'Low Risk';
    if (r <= 0.4) return 'Moderate Risk';
    if (r <= 0.6) return 'High Risk';
    return 'Very High Risk';
  };

  return (
    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-300">Readmission Risk</p>
        <Badge variant="outline" className={`text-xs ${pct > 60 ? 'bg-red-950/50 text-red-300 border-red-800/50' : pct > 40 ? 'bg-amber-950/50 text-amber-300 border-amber-800/50' : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50'}`}>
          {getLabel(risk)}
        </Badge>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div className={`h-2 rounded-full ${getColor(risk)}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-slate-500 mt-1">{pct}% chance of 30-day readmission</p>
    </div>
  );
}

function BoolIndicator({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {value ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
      <span className="text-slate-300">{label}</span>
    </div>
  );
}

export function DischargeSection() {
  const { currentPatient } = useAppStore();
  const [assessments, setAssessments] = useState<DischargeAssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentPatient) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/patients/${currentPatient.id}/discharge-assessments`);
        if (res.ok) {
          const data = await res.json();
          setAssessments(data.dischargeAssessments || []);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    loadData();
  }, [currentPatient]);

  if (!currentPatient) return null;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Home className="w-6 h-6 text-emerald-400" />
          Discharge Safety
        </h2>
        <p className="text-slate-400 text-sm mt-1">Discharge readiness assessments and AI recommendations</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading assessments...</div>
      ) : assessments.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Home className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No discharge assessments recorded</p>
          <p className="text-sm mt-1">Assessments will appear when discharge planning begins</p>
        </div>
      ) : (
        <div className="space-y-6">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="p-5 rounded-xl bg-slate-900/50 border border-slate-700/50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Visit Date</p>
                  <p className="font-medium">{assessment.visitDate}</p>
                </div>
              </div>

              {/* Safety Score & Readmission Risk */}
              <div className="grid md:grid-cols-2 gap-4">
                <SafetyScoreGauge score={assessment.dischargeSafetyScore} />
                <RiskMeter risk={assessment.readmissionRisk} />
              </div>

              {/* AI Recommendation */}
              {assessment.aiRecommendation && (
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/30">
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-300 mb-1">AI Recommendation</p>
                      <p className="text-sm text-slate-300">{assessment.aiRecommendation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
