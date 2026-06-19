import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();

    const event = await db.medicalTimelineEvent.update({
      where: { id: eventId },
      data: {
        eventType: body.eventType,
        title: body.title,
        description: body.description,
        eventDate: body.eventDate,
        facility: body.facility,
        severity: body.severity,
        icon: body.icon,
        metadata: body.metadata,
      },
    });

    return NextResponse.json({ timelineEvent: event });
  } catch (error) {
    console.error('Update timeline event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { eventId } = await params;
    await db.medicalTimelineEvent.delete({ where: { id: eventId } });
    return NextResponse.json({ message: 'Timeline event removed' });
  } catch (error) {
    console.error('Delete timeline event error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
