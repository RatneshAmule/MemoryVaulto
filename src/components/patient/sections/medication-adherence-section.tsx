'use client';
import { useAppStore } from '@/stores/app-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Thermometer } from 'lucide-react';

export function MedicationAdherenceSection() {
  const { currentPatient } = useAppStore();
  const items = currentPatient?.medicationAdherence || [];
  return (
    <div>
      <div className="mb-4"><h2 className="text-xl font-bold flex items-center gap-2"><Thermometer className="w-5 h-5 text-orange-400" /> Medication Adherence</h2><p className="text-sm text-slate-400">How reliable is the medication list?</p></div>
      {items.length === 0 ? <p className="text-slate-500 text-sm">No adherence data</p> : (
        <div className="space-y-3">{items.map((a, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800"><CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{a.medicationName}</span>
              <Badge className={a.overallScore >= 90 ? 'bg-green-500/20 text-green-400' : a.overallScore >= 70 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}>
                {a.overallScore >= 90 ? 'Reliable' : a.overallScore >= 70 ? 'Moderate' : 'Unreliable'}
              </Badge>
            </div>
            <Progress value={a.overallScore} className="h-2 mb-1" />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{a.overallScore}% adherence</span>
              <span>{a.missedDosesLast30Days ?? '?'} missed doses/30d</span>
              <span>{a.source}</span>
            </div>
          </CardContent></Card>
        ))}</div>
      )}
    </div>
  );
}
