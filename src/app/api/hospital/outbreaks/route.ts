import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const outbreaks = await db.outbreakAlert.findMany({ where: { status: 'active' }, orderBy: { createdAt: 'desc' } });
    // Also compute from patient data (aggregate ZIP codes)
    const patients = await db.patient.findMany({ where: { zipCode: { not: null } }, select: { zipCode: true, conditions: true } });
    const zipCounts: Record<string, number> = {};
    for (const p of patients) {
      if (p.zipCode) { zipCounts[p.zipCode] = (zipCounts[p.zipCode] || 0) + 1; }
    }
    const hotspots = Object.entries(zipCounts).filter(([, c]) => c >= 2).map(([zip, count]) => ({ zipCode: zip, patientCount: count }));
    return NextResponse.json({ outbreaks, hotspots, totalActive: outbreaks.length });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
