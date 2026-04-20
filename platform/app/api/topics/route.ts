import { NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';

export async function GET() {
  const topics = getConfig().topics.map(({ id, label }) => ({ id, label }));
  return NextResponse.json(topics);
}
