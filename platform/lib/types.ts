export interface Example {
  input: string;
  output: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  link: string;
  description: string;
  examples: Example[];
  constraints: string[];
  hint: string;
  testFile: string;
  starterCode: string;
}

export interface Topic {
  id: string;
  label: string;
  dir: string;
  testsDir: string;
  sharedFiles: string[];
  nodeDefinition: string;
  problems: Problem[];
}

export interface TopicSummary {
  id: string;
  label: string;
}

export interface RunResult {
  success: boolean;
  output: string;
}
