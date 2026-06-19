import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    const body = await request.json();

    const device = await db.deviceIntegration.update({
      where: { id: deviceId },
      data: {
        deviceType: body.deviceType,
        deviceName: body.deviceName,
        manufacturer: body.manufacturer,
        model: body.model,
        serialNumber: body.serialNumber,
        lastSyncDate: body.lastSyncDate,
        batteryLevel: body.batteryLevel,
        dataSummary: body.dataSummary,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({ deviceIntegration: device });
  } catch (error) {
    console.error('Update device integration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; deviceId: string }> }
) {
  try {
    const { deviceId } = await params;
    // Soft delete
    await db.deviceIntegration.update({
      where: { id: deviceId },
      data: { isActive: false },
    });
    return NextResponse.json({ message: 'Device integration deactivated' });
  } catch (error) {
    console.error('Delete device integration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
