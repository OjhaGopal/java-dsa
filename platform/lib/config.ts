import path from 'path';
import fs from 'fs';
import type { Topic } from './types';

let _config: { topics: Topic[] } | null = null;

export function getConfig(): { topics: Topic[] } {
  if (!_config) {
    const file = path.join(process.cwd(), 'topics.json');
    _config = JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  return _config!;
}

export function getTopic(id: string): Topic | undefined {
  return getConfig().topics.find(t => t.id === id);
}

export function resolveDir(topic: Topic): string {
  return path.resolve(process.cwd(), topic.dir);
}

export function resolveTestsDir(topic: Topic): string {
  return path.resolve(process.cwd(), topic.testsDir);
}
