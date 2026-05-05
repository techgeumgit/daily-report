import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { isAdmin } from '@/lib/auth';

// POST /api/admin/users - admin creates a new user
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    if (!(await isAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A user with this name already exists' },
        { status: 409 }
      );
    }

    const user = await User.create({ name: name.trim(), isActive: true });
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
