import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { proxyName, relationship, phone, priority, verified } = await request.json();

    if (!proxyName || !relationship || !phone) {
      return NextResponse.json({ error: 'Proxy name, relationship, and phone are required' }, { status: 400 });
    }

    const proxy = await db.consentProxy.create({
      data: { patientId: id, proxyName, relationship, phone, priority: priority || 1, verified: verified || false },
    });

    return NextResponse.json({ proxy }, { status: 201 });
  } catch (error) {
    console.error('Add consent proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { proxyId } = await request.json();
    if (!proxyId) {
      return NextResponse.json({ error: 'proxyId is required' }, { status: 400 });
    }
    await db.consentProxy.delete({ where: { id: proxyId } });
    return NextResponse.json({ message: 'Consent proxy removed' });
  } catch (error) {
    console.error('Delete consent proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
