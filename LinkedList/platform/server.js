const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const LL_DIR = path.join(__dirname, '..'); 
const TESTS_DIR = path.join(LL_DIR, 'tests');

const PROBLEMS = [
    {
        id: 'InsertAtHead',
        title: 'Insert at Head',
        difficulty: 'Easy',
        link: 'https://leetcode.com/problems/design-linked-list/',
        description: 'Insert a new node with the given value at the head of the linked list. Return the new head.',
        starterCode: 'public class InsertAtHead {\n    public ListNode insertAtHead(ListNode head, int val) {\n        // TODO\n        return head;\n    }\n}',
        testFile: 'TestInsertAtHead',
    },
    {
        id: 'InsertAtTail',
        title: 'Insert at Tail',
        difficulty: 'Easy',
        link: 'https://leetcode.com/problems/design-linked-list/',
        description: 'Insert a new node with the given value at the tail of the linked list. Return the head.',
        starterCode: 'public class InsertAtTail {\n    public ListNode insertAtTail(ListNode head, int val) {\n        // TODO\n        return head;\n    }\n}',
        testFile: 'TestInsertAtTail',
    },
    {
        id: 'InsertAtIndex',
        title: 'Insert at Index',
        difficulty: 'Medium',
        link: 'https://leetcode.com/problems/design-linked-list/',
        description: 'Insert a new node with the given value at the given 0-based index. Return the head.',
        starterCode: 'public class InsertAtIndex {\n    public ListNode insertAtIndex(ListNode head, int index, int val) {\n        // TODO\n        return head;\n    }\n}',
        testFile: 'TestInsertAtIndex',
    },
    {
        id: 'DeleteHead',
        title: 'Delete Head',
        difficulty: 'Easy',
        link: 'https://leetcode.com/problems/design-linked-list/',
        description: 'Delete the head node of the linked list. Return the new head. If the list is empty, return null.',
        starterCode: 'public class DeleteHead {\n    public ListNode deleteHead(ListNode head) {\n        // TODO\n        return head;\n    }\n}',
        testFile: 'TestDeleteHead',
    },
    {
        id: 'DeleteAtIndex',
        title: 'Delete at Index',
        difficulty: 'Medium',
        link: 'https://leetcode.com/problems/delete-node-in-a-linked-list/',
        description: 'Delete the node at the given 0-based index in the linked list. Return the head.',
        starterCode: 'public class DeleteAtIndex {\n    public ListNode deleteAtIndex(ListNode head, int index) {\n        // TODO\n        return head;\n    }\n}',
        testFile: 'TestDeleteAtIndex',
    },
    {
        id: 'ReverseLinkedList',
        title: 'Reverse Linked List',
        difficulty: 'Easy',
        link: 'https://leetcode.com/problems/reverse-linked-list/',
        description: 'Given the head of a singly linked list, reverse the list and return it.',
        starterCode: 'public class ReverseLinkedList {\n    public ListNode reverseList(ListNode head) {\n        // TODO\n        return head;\n    }\n}',
        testFile: 'TestReverseLinkedList',
    },
    {
        id: 'FindMid',
        title: 'Find Middle of Linked List',
        difficulty: 'Easy',
        link: 'https://leetcode.com/problems/middle-of-the-linked-list/',
        description: 'Given the head of a singly linked list, return the middle node. If two middle nodes exist, return the second one.',
        starterCode: 'public class FindMid {\n    public ListNode middleNode(ListNode head) {\n        // TODO\n        return head;\n    }\n}',
        testFile: 'TestFindMid',
    },
    {
        id: 'DetectCycle',
        title: 'Detect Cycle',
        difficulty: 'Easy',
        link: 'https://leetcode.com/problems/linked-list-cycle/',
        description: 'Given the head of a linked list, return true if there is a cycle, false otherwise.',
        starterCode: 'public class DetectCycle {\n    public boolean hasCycle(ListNode head) {\n        // TODO\n        return false;\n    }\n}',
        testFile: 'TestDetectCycle',
    },
    {
        id: 'FloydCycle',
        title: "Floyd's Cycle Detection",
        difficulty: 'Medium',
        link: 'https://leetcode.com/problems/linked-list-cycle-ii/',
        description: "Return the node where the cycle begins. If there is no cycle, return null. Use Floyd's algorithm.",
        starterCode: 'public class FloydCycle {\n    public ListNode detectCycle(ListNode head) {\n        // TODO\n        return null;\n    }\n}',
        testFile: 'TestFloydCycle',
    },
];

app.get('/api/problems', (_, res) => {
    res.json(PROBLEMS.map(({ id, title, difficulty, link, description, starterCode }) =>
        ({ id, title, difficulty, link, description, starterCode })
    ));
});

app.get('/api/code/:id', (req, res) => {
    const p = PROBLEMS.find(p => p.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    try {
        const code = fs.readFileSync(path.join(LL_DIR, `${p.id}.java`), 'utf8');
        res.json({ code });
    } catch {
        res.json({ code: p.starterCode });
    }
});

app.post('/api/run/:id', (req, res) => {
    const p = PROBLEMS.find(p => p.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });

    const { code } = req.body;
    fs.writeFileSync(path.join(LL_DIR, `${p.id}.java`), code, 'utf8');

    const sep = process.platform === 'win32' ? ';' : ':';
    const listNode  = path.join(LL_DIR, 'ListNode.java');
    const solution  = path.join(LL_DIR, `${p.id}.java`);
    const testFile  = path.join(TESTS_DIR, `${p.testFile}.java`);
    const compileCmd = `javac -cp "${LL_DIR}" "${listNode}" "${solution}" "${testFile}"`;
    const runCmd     = `java -cp "${LL_DIR}${sep}${TESTS_DIR}" ${p.testFile}`;

    exec(compileCmd, { cwd: LL_DIR }, (err, _, stderr) => {
        if (err) return res.json({ success: false, output: stderr });
        exec(runCmd, { cwd: LL_DIR, timeout: 10000 }, (err, stdout, stderr) => {
            res.json({ success: !err, output: stdout || stderr });
        });
    });
});

app.listen(3000, () => console.log('✅  DSA Platform → http://localhost:3000'));
