import { NextRequest, NextResponse } from 'next/server';

// Extend globalThis for type safety
declare global {
  // eslint-disable-next-line no-var
  var _onlineUsers: Set<string> | undefined;
}

// In-memory store (for demo/dev only)
let onlineUsers: Set<string> = global._onlineUsers || new Set();
global._onlineUsers = onlineUsers;

// GET: Return list of online user emails
export async function GET() {
  return NextResponse.json({ success: true, users: Array.from(onlineUsers) });
}

// POST: Add a user to online list (expects { email })
export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (email) {
    onlineUsers.add(email);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: 'Missing email' }, { status: 400 });
}

// DELETE: Remove a user from online list (expects { email })
export async function DELETE(request: NextRequest) {
  const { email } = await request.json();
  if (email) {
    onlineUsers.delete(email);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false, error: 'Missing email' }, { status: 400 });
} 