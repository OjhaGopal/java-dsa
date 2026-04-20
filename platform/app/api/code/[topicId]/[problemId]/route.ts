import { NextResponse } from 'next/server';
import { getTopic, resolveDir } from '@/lib/config';
import path from 'path';
import fs from 'fs';

export async function GET(_: Request, { params }: { params: Promise<{ topicId: string; problemId: string }> }) {
  const { topicId, problemId } = await params;
  const topic = getTopic(topicId);
  const problem = topic?.problems.find(p => p.id === problemId);
  if (!problem) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const file = path.join(resolveDir(topic!), `${problemId}.java`);
  try {
    const raw = fs.readFileSync(file, 'utf8');
    const code = raw.replace(/^(\/\/[^\n]*\n)*/m, '').trimStart();
    return NextResponse.json({ code });
  } catch {
    return NextResponse.json({ code: problem.starterCode });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ topicId: string; problemId: string }> }) {
  const { topicId, problemId } = await params;
  const topic = getTopic(topicId);
  if (!topic?.problems.find(p => p.id === problemId))
    return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { code } = await req.json();
  const dir = resolveDir(topic!);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${problemId}.java`), code, 'utf8');
  return NextResponse.json({ ok: true });
}
