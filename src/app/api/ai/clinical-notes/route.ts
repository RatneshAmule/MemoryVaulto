import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { patientId, encounterData } = await request.json();
    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: {
        allergies: true, medications: true, conditions: true, surgeries: true,
        user: { select: { name: true } },
      }
    });
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    const age = Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    const enc = encounterData || {};

    const notes = {
      chiefComplaint: enc.chiefComplaint || 'Not specified',
      historyOfPresentIllness: `${patient.user.name}, ${age}-year-old ${patient.gender}, presents with ${enc.chiefComplaint || 'undifferentiated complaint'}. ${enc.hpiDetail || 'Patient was found unconscious/unable to provide history. Medical information obtained from Memory Vault emergency access.'}`,
      pastMedicalHistory: patient.conditions.map(c => `${c.name} (${c.status}${c.diagnosedDate ? ', diagnosed ' + c.diagnosedDate : ''})`).join('; ') || 'None documented',
      pastSurgicalHistory: patient.surgeries.map(s => `${s.name} (${s.date})`).join('; ') || 'None documented',
      currentMedications: patient.medications.map(m => `${m.name} ${m.dose} ${m.frequency}`).join('; ') || 'None documented',
      allergies: patient.allergies.map(a => `${a.name} (${a.severity}, reaction: ${a.reaction || 'unknown'})`).join('; ') || 'NKDA',
      assessmentAndPlan: enc.assessment || 'Assessment pending based on workup results.',
      disposition: enc.disposition || 'Pending',
    };

    return NextResponse.json({ patientId, patientName: patient.user.name, notes, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Clinical notes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
