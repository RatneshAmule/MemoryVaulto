'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Interaction {
  drug: string;
  contraindication: string;
  type: string;
  severity: string;
  description: string;
}

interface DrugCheckResult {
  safe: boolean;
  hasDanger: boolean;
  interactions: Interaction[];
}

export function DrugChecker({ patientId }: { patientId: string }) {
  const [drugName, setDrugName] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<DrugCheckResult | null>(null);

  const handleCheck = async () => {
    if (!drugName.trim()) return;
    setChecking(true);
    setResult(null);
    try {
      const res = await fetch('/api/drugs/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId, drugName }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      }
    } catch { /* ignore */ }
    setChecking(false);
  };

  const severityColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    danger: { bg: 'bg-red-950/30', border: 'border-red-800/50', text: 'text-red-300', icon: 'text-red-500' },
    warning: { bg: 'bg-amber-950/30', border: 'border-amber-800/50', text: 'text-amber-300', icon: 'text-amber-500' },
    caution: { bg: 'bg-yellow-950/30', border: 'border-yellow-800/50', text: 'text-yellow-300', icon: 'text-yellow-500' },
  };

  return (
    <div className="sticky top-6">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-emerald-400" /> Drug Safety Check
      </h3>

      <div className="flex gap-2 mb-4">
        <Input
          value={drugName}
          onChange={(e) => setDrugName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          className="bg-slate-900 border-slate-700 text-white"
          placeholder="Enter drug name..."
        />
        <Button onClick={handleCheck} disabled={checking} className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
          {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {result && (
        <div className="space-y-3">
          {result.safe ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold text-emerald-300">SAFE TO ADMINISTER</span>
              </div>
              <p className="text-sm text-emerald-400/70">No interactions found for {drugName}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {result.hasDanger && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 pulse-glow">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="font-bold text-red-300">CONTRAINDICATIONS DETECTED</span>
                  </div>
                </div>
              )}
              {result.interactions.map((interaction, i) => {
                const colors = severityColors[interaction.severity] || severityColors.warning;
                return (
                  <div key={i} className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className={`w-4 h-4 ${colors.icon}`} />
                      <span className={`font-medium text-sm ${colors.text}`}>
                        {interaction.severity.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400">
                        via {interaction.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{interaction.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick check buttons */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <p className="text-xs text-slate-500 mb-2">Quick check:</p>
        <div className="flex flex-wrap gap-2">
          {['Ibuprofen', 'Aspirin', 'Amoxicillin', 'Morphine', 'Naproxen', 'Celecoxib'].map((drug) => (
            <button
              key={drug}
              onClick={() => { setDrugName(drug); }}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
            >
              {drug}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
