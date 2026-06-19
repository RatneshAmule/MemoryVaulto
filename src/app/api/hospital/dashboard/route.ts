import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get recent emergency accesses
    const recentAccesses = await db.accessLog.findMany({
      where: { accessType: 'emergency' },
      include: {
        accessor: { select: { name: true, role: true, hospital: true } },
        patient: { include: { user: { select: { name: true } } } }
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });

    // Get all patients for dashboard
    const patients = await db.patient.findMany({
      include: {
        user: { select: { name: true, email: true } },
        allergies: true, medications: true, conditions: true, implants: true,
        bloodAntibodies: true, geneticFlags: true, culturalDirectives: true,
        pharmacogenomics: true, vitalBaselines: true, deviceIntegrations: true,
        voiceMessages: { where: { isActive: true } },
        advanceDirectives: { where: { isActive: true } },
        occupationalExposures: true, radiationExposures: true,
        painProfile: true, medicationAdherence: true,
        emergencyContacts: { orderBy: { priority: 'asc' } },
        consentProxies: { orderBy: { priority: 'asc' } },
        medicalTimeline: { orderBy: { eventDate: 'desc' }, take: 5 },
        dischargeAssessments: { orderBy: { createdAt: 'desc' }, take: 1 },
      }
    });

    // Stats
    const totalPatients = patients.length;
    const totalAccesses = await db.accessLog.count();
    const activeEmergencies = recentAccesses.filter(a => a.expiresAt && new Date(a.expiresAt) > new Date()).length;
    const organDonors = patients.filter(p => p.organDonor).length;

    return NextResponse.json({
      stats: { totalPatients, totalAccesses, activeEmergencies, organDonors },
      recentAccesses,
      patients,
    });
  } catch (error) {
    console.error('Hospital dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
