import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const matches = await db.organMatch.findMany({ orderBy: { createdAt: 'desc' } });
    // Find organ donors needing match
    const donors = await db.patient.findMany({
      where: { organDonor: true },
      include: { user: { select: { name: true } } }
    });
    return NextResponse.json({ matches, availableDonors: donors.length, donors: donors.map(d => ({ id: d.id, name: d.user.name, bloodType: `${d.bloodType}${d.rhFactor || ''}` })) });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { donorPatientId, organType } = await request.json();
    const donor = await db.patient.findUnique({ where: { id: donorPatientId } });
    if (!donor) return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
    
    // Find compatible recipients (patients who need organs — for demo, find matching blood types)
    const compatible = await db.patient.findMany({
      where: { bloodType: donor.bloodType },
      include: { user: { select: { name: true } } },
      take: 5,
    });

    const match = await db.organMatch.create({
      data: {
        donorPatientId,
        organType,
        bloodMatch: true,
        tissueMatch: Math.round(Math.random() * 40 + 60), // simulated
        facility: 'City General Hospital',
        distance: Math.round(Math.random() * 50 + 5),
        viabilityMinutes: organType === 'heart' ? 360 : organType === 'lungs' ? 480 : organType === 'liver' ? 720 : organType === 'kidney' ? 1440 : 4320,
        status: 'searching',
      }
    });

    return NextResponse.json({ match, compatibleRecipients: compatible.map(c => ({ id: c.id, name: c.user.name, bloodType: `${c.bloodType}${c.rhFactor || ''}` })) });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
