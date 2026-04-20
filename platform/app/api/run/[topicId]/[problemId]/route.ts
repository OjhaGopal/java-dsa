import { NextResponse } from 'next/server';
import { getTopic, resolveDir, resolveTestsDir } from '@/lib/config';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const SEP = process.platform === 'win32' ? ';' : ':';

export async function POST(req: Request, { params }: { params: Promise<{ topicId: string; problemId: string }> }) {
  const { topicId, problemId } = await params;
  const topic = getTopic(topicId);
  const problem = topic?.problems.find(p => p.id === problemId);
  if (!problem) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { code } = await req.json();
  const dir      = resolveDir(topic!);
  const testsDir = resolveTestsDir(topic!);

  // save solution file (no comment header needed)
  fs.writeFileSync(path.join(dir, `${problemId}.java`), code, 'utf8');

  const shared   = (topic!.sharedFiles || []).map(f => `"${path.join(dir, f)}"`).join(' ');
  const solution = `"${path.join(dir, problemId + '.java')}"`;
  const testFile = `"${path.join(testsDir, problem.testFile + '.java')}"`;

  const compileCmd = `javac -cp "${dir}" ${shared} ${solution} ${testFile}`;
  const runCmd     = `java -cp "${dir}${SEP}${testsDir}" ${problem.testFile}`;

  try {
    await execAsync(compileCmd, { cwd: dir });
  } catch (e: any) {
    return NextResponse.json({ success: false, output: e.stderr || e.message });
  }

  try {
    const { stdout } = await execAsync(runCmd, { cwd: dir, timeout: 10000 });
    return NextResponse.json({ success: true, output: stdout });
  } catch (e: any) {
    return NextResponse.json({ success: false, output: e.stdout || e.stderr || e.message });
  }
}
