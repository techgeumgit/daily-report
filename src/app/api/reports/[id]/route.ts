import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Report from '@/models/Report';
import { isAdmin } from '@/lib/auth';

// PUT /api/reports/[id] - admin edit (no 48h restriction)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { date, name, todaysWork, meetingAttended, bottleneck, tomorrowPlan } = body;

    if (!name || !todaysWork || !tomorrowPlan) {
      return NextResponse.json(
        { success: false, error: 'Name, today\'s work, and tomorrow\'s plan are required.' },
        { status: 400 }
      );
    }

    const updated = await Report.findByIdAndUpdate(
      id,
      {
        date: date ? new Date(date) : undefined,
        name: name.trim(),
        todaysWork: todaysWork.trim(),
        meetingAttended: meetingAttended?.trim() || '',
        bottleneck: bottleneck?.trim() || '',
        tomorrowPlan: tomorrowPlan.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/reports/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    if (!(await isAdmin())) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const deleted = await Report.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    console.error('DELETE /api/reports/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
