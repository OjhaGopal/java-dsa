import { NextResponse } from 'next/server';
import { getTopic } from '@/lib/config';

export async function GET(_: Request, { params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const topic = getTopic(topicId);
  if (!topic) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const problems = topic.problems.map(({ id, title, difficulty, link, description, examples, constraints, hint, starterCode }) =>
    ({ id, title, difficulty, link, description, examples, constraints, hint, starterCode })
  );
  return NextResponse.json(problems);
}
