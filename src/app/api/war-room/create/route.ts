import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { patientId } = await request.json();
    const roomId = `WR-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: { emergencyContacts: true, user: { select: { name: true } } }
    });
    if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

    const warRoom = await db.familyWarRoom.create({
      data: {
        patientId, roomId, status: 'active',
        patientStatus: 'unknown', patientLocation: 'ER',
        members: {
          create: patient.emergencyContacts.map(c => ({
            name: c.name, role: c.relationship, phone: c.phone, email: c.email
          }))
        },
        updates: {
          create: { type: 'status-change', content: `War Room created for ${patient.user.name}. Patient in ER.` }
        }
      },
      include: { members: true, updates: true }
    });

    return NextResponse.json({ warRoom });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
