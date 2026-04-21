# java-question — DSA Learning Platform

## Project Layout

```
java-question/
├── platform/          # Next.js 16 web app (run from here)
├── LinkedList/        # Java source files + tests
│   ├── ListNode.java  # Shared helper (build, print, check, buildWithCycle)
│   ├── *.java         # Solution stubs (one per problem)
│   └── tests/         # Test files (TestInsertAtHead.java, etc.)
├── HashMap/
├── Recursion/
├── arrayLeetCode/
└── searching/
```

## Running the Platform

```bash
cd platform
npm run dev     # starts at http://localhost:3000
```

Requires Java (`javac`, `java`) on PATH — tests are compiled and run server-side.

## How the Run Pipeline Works

1. POST `/api/run/[topicId]/[problemId]` receives user code.
2. Writes the solution `.java` file into the topic `dir`.
3. Runs `javac` to compile: shared files + solution + test file.
4. Runs `java` to execute the test class and returns stdout.

## Path Configuration (`platform/topics.json`)

Paths are **relative to `platform/` (process.cwd())**:

```json
{
  "dir": "../LinkedList",        // resolves to java-question/LinkedList/
  "testsDir": "../LinkedList/tests"
}
```

> IMPORTANT: Never use `../../` — that would escape the repo to Desktop/.

## Key Files

| File | Purpose |
|------|---------|
| `platform/topics.json` | Central registry of topics and problems |
| `platform/lib/config.ts` | Loads topics.json; `resolveDir()`, `resolveTestsDir()` |
| `platform/lib/types.ts` | TypeScript types: `Topic`, `Problem`, `RunResult` |
| `platform/app/api/run/[topicId]/[problemId]/route.ts` | Compile & run Java |
| `platform/app/api/code/[topicId]/[problemId]/route.ts` | Read saved code or starter |
| `LinkedList/ListNode.java` | Shared node class — **do not overwrite** |

## Test Output Format

Tests use `ListNode.check(label, output, expect)` which prints:

```
Insert 4 into [1,2,3]            | Output: 1 -> 2 -> 3 -> 4     | Expect: 1 -> 2 -> 3 -> 4     | PASS ✓
```

The UI visualizer parses this pipe-delimited format.

## Adding a New Topic

1. Add Java source files and test files in a new top-level directory.
2. Add a new entry in `platform/topics.json` with `"dir": "../YourTopic"`.
3. Test files must produce pipe-delimited output matching the format above.
