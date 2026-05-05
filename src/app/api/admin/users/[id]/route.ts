import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { isAdmin } from '@/lib/auth';

// PUT /api/admin/users/[id] - toggle active status or rename
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isActive, name } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {};
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (name?.trim()) updates.name = name.trim();

    const updated = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/admin/users/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('DELETE /api/admin/users/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
