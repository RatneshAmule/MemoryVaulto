import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { patientId, message, accessorId } = await request.json();
    if (!patientId || !message || !accessorId) {
      return NextResponse.json({ error: 'patientId, message, and accessorId are required' }, { status: 400 });
    }

    const patient = await db.patient.findUnique({
      where: { id: patientId },
      include: {
        emergencyContacts: { orderBy: { priority: 'asc' } },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Create cascade simulation
    const cascade = patient.emergencyContacts.map((contact, index) => ({
      contactId: contact.id,
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      priority: contact.priority,
      status: 'pending' as string,
      timestamp: null as string | null,
    }));

    // Simulate notification cascade with delays
    const notificationResults = cascade.map((entry, index) => {
      const delay = index * 2; // seconds
      const notifiedAt = new Date(Date.now() + delay * 1000).toISOString();
      return {
        ...entry,
        status: 'notified' as string,
        timestamp: notifiedAt,
        delay: `${delay}s`,
      };
    });

    // Log the cascade to an AccessLog entry
    await db.accessLog.create({
      data: {
        accessorId,
        patientId,
        accessType: 'emergency',
        accessMethod: 'notification-cascade',
        reason: `Emergency notification cascade: ${message}`,
        dataViewed: JSON.stringify({
          type: 'notification-cascade',
          message,
          cascade: notificationResults.map(r => ({
            contactName: r.name,
            relationship: r.relationship,
            phone: r.phone,
            status: r.status,
            timestamp: r.timestamp,
          })),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      cascade: notificationResults,
      message: `Notification cascade initiated for ${patient.emergencyContacts.length} contacts`,
    });
  } catch (error) {
    console.error('Notification cascade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
