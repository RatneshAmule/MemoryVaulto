import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const timelineEvents = await db.medicalTimelineEvent.findMany({
      where: { patientId: id },
      orderBy: { eventDate: 'desc' },
    });
    return NextResponse.json({ timelineEvents });
  } catch (error) {
    console.error('Get timeline events error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { eventType, title, description, eventDate, facility, severity, icon, metadata } = await request.json();

    if (!eventType || !title || !description || !eventDate) {
      return NextResponse.json({ error: 'eventType, title, description, and eventDate are required' }, { status: 400 });
    }

    const event = await db.medicalTimelineEvent.create({
      data: {
        patientId: id,
        eventType,
        title,
        description,
        eventDate,
        facility: facility || null,
        severity: severity || null,
        icon: icon || null,
        metadata: metadata || null,
      },
    });

    return NextResponse.json({ timelineEvent: event }, { status: 201 });
  } catch (error) {
    console.error('Add timeline event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
