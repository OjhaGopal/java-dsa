# Java DSA Learning Platform

> Interactive DSA practice with Java — step-by-step visualizations, in-browser code editor, and auto-graded test cases.

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Progress](https://img.shields.io/badge/Progress-Active-success?style=for-the-badge)

---

## Getting Started

**Requirements**: Java 11+, Node.js 18+

```bash
# 1. Install platform dependencies
cd platform
npm install

# 2. Start the dev server
npm run dev
# → http://localhost:3000
```

Open a problem, write Java in the editor, hit **Run Tests** — the visualizer animates your solution step by step.

---

## Features

- **Monaco editor** with Java syntax highlighting
- **Auto-save** — code is saved to disk as you type and prefilled on every return visit
- **Step-by-step visualizer** — animates pointer movement, insertions, deletions, slow/fast pointers
- **Inline test runner** — compiles and runs Java tests server-side, shows PASS/FAIL per case
- **Resizable panels** — drag the dividers to adjust layout

---

## Project Structure

```
java-question/
├── platform/                  # Next.js web app (run from here)
│   ├── app/
│   │   ├── page.tsx           # Home — topic/problem grid
│   │   ├── problem/[topicId]/[problemId]/page.tsx
│   │   └── api/
│   │       ├── topics/        # GET topic list
│   │       ├── code/          # GET saved code, POST auto-save
│   │       └── run/           # POST compile + run Java
│   ├── components/
│   │   ├── Visualizer.tsx     # Animated step-by-step viz
│   │   └── DescriptionPanel.tsx
│   ├── lib/
│   │   ├── config.ts          # Loads topics.json, resolves paths
│   │   └── types.ts           # TypeScript interfaces
│   └── topics.json            # Problem registry
│
├── LinkedList/                # Java implementations
│   ├── ListNode.java          # Shared node class (build, print, check helpers)
│   ├── InsertAtHead.java
│   ├── InsertAtTail.java
│   └── ...
│   └── tests/                 # Test files (TestInsertAtHead.java, etc.)
│
├── HashMap/
├── Recursion/
├── arrayLeetCode/
└── searching/
```

---

## Progress

### Linked List — 8 problems

| Problem | Difficulty | Visualizer |
|---------|-----------|-----------|
| Insert at Head | Easy | curr pointer animation |
| Insert at Tail | Easy | traverse + attach animation |
| Insert at Index | Medium | predecessor traversal |
| Delete Head | Easy | head removal |
| Delete at Index | Medium | predecessor skip |
| Reverse Linked List | Easy | prev/curr/next pointer reversal |
| Find Middle | Easy | slow/fast pointer |
| Detect Cycle | Easy | slow/fast meet detection |
| Floyd's Cycle Detection | Medium | two-phase entry finder |

### Other Implementations

| Topic | Files |
|-------|-------|
| HashMap | `arrayByHashMap.java`, `NonRepeatingArray.java` |
| Recursion | `fibonacci.java`, `factorial.java`, `sumofnum.java` |
| Searching | `binarysearch.java` |
| Array LeetCode | `removeDuplicates.java`, `arraysortedrotated.java` |

### Data Structures Roadmap

| Topic | Status |
|-------|--------|
| HashMap | ✅ Complete |
| Linked List | 🚧 Platform ready, solutions in progress |
| Recursion | 🚧 Examples added |
| Sorting | ⭕ Not started |
| Searching | ⭕ Not started |
| Stacks / Queue | ⭕ Not started |
| Trees | ⭕ Not started |
| Dynamic Programming | ⭕ Not started |
| Graphs | ⭕ Not started |

> **Legend**: ✅ Complete | 🚧 In Progress | ⭕ Not Started

---

## Adding a New Topic

1. Create a directory (e.g. `Stack/`) with solution stubs and a `tests/` subfolder.
2. Tests must print pipe-delimited output via a `check()` helper:
   ```
   Label                    | Output: <value>   | Expect: <value>   | PASS ✓
   ```
3. Add an entry to `platform/topics.json`:
   ```json
   {
     "id": "Stack",
     "label": "Stack",
     "dir": "../Stack",
     "testsDir": "../Stack/tests",
     "sharedFiles": [],
     "problems": [ ... ]
   }
   ```

---

## Resources

- [Oracle Java Docs](https://docs.oracle.com/en/java/)
- [Big O Cheat Sheet](https://www.bigocheatsheet.com/)
- [LeetCode](https://leetcode.com/)
