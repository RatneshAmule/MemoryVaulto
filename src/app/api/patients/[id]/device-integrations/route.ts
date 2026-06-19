import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deviceIntegrations = await db.deviceIntegration.findMany({
      where: { patientId: id, isActive: true },
    });
    return NextResponse.json({ deviceIntegrations });
  } catch (error) {
    console.error('Get device integrations error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { deviceType, deviceName, manufacturer, model, serialNumber, lastSyncDate, batteryLevel, dataSummary } = await request.json();

    if (!deviceType || !deviceName) {
      return NextResponse.json({ error: 'deviceType and deviceName are required' }, { status: 400 });
    }

    const device = await db.deviceIntegration.create({
      data: {
        patientId: id,
        deviceType,
        deviceName,
        manufacturer: manufacturer || null,
        model: model || null,
        serialNumber: serialNumber || null,
        lastSyncDate: lastSyncDate || null,
        batteryLevel: batteryLevel || null,
        dataSummary: dataSummary || null,
      },
    });

    return NextResponse.json({ deviceIntegration: device }, { status: 201 });
  } catch (error) {
    console.error('Add device integration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
