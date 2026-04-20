public class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }

    public static ListNode build(int[] arr) {
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (int v : arr) { curr.next = new ListNode(v); curr = curr.next; }
        return dummy.next;
    }

    public static ListNode buildWithCycle(int[] arr, int cyclePos) {
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (int v : arr) { curr.next = new ListNode(v); curr = curr.next; }
        if (cyclePos == -1) return dummy.next;
        ListNode tail = curr;
        ListNode entry = dummy.next;
        for (int i = 0; i < cyclePos; i++) entry = entry.next;
        tail.next = entry;
        return dummy.next;
    }

    public static String print(ListNode head) {
        StringBuilder sb = new StringBuilder();
        while (head != null) {
            sb.append(head.val).append(head.next != null ? " -> " : "");
            head = head.next;
        }
        return sb.length() == 0 ? "[]" : sb.toString();
    }

    public static void check(String label, String output, String expect) {
        boolean pass = output.equals(expect);
        System.out.printf("%-40s | Output: %-22s | Expect: %-22s | %s%n",
                label, output, expect, pass ? "PASS ✓" : "FAIL ✗");
    }
}
