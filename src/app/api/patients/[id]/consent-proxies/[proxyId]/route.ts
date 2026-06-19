import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; proxyId: string }> }
) {
  try {
    const { proxyId } = await params;
    const body = await request.json();

    const proxy = await db.consentProxy.update({
      where: { id: proxyId },
      data: {
        proxyName: body.proxyName,
        relationship: body.relationship,
        phone: body.phone,
        email: body.email,
        priority: body.priority,
        verified: body.verified,
        governmentId: body.governmentId,
        consentScope: body.consentScope,
        activeFrom: body.activeFrom,
      },
    });

    return NextResponse.json({ consentProxy: proxy });
  } catch (error) {
    console.error('Update consent proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; proxyId: string }> }
) {
  try {
    const { proxyId } = await params;
    await db.consentProxy.delete({ where: { id: proxyId } });
    return NextResponse.json({ message: 'Consent proxy removed' });
  } catch (error) {
    console.error('Delete consent proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
