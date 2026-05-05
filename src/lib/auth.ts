import { cookies } from 'next/headers';

export async function isAdmin() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    const sessionSecret = process.env.SESSION_SECRET;

    if (!session?.value || !sessionSecret) return false;

    const decoded = Buffer.from(session.value, 'base64').toString('utf8');
    return decoded.endsWith(`:${sessionSecret}`);
  } catch (error) {
    return false;
  }
}
