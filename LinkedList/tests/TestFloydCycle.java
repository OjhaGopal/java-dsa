public class TestFloydCycle {
    public static void main(String[] args) {
        FloydCycle sol = new FloydCycle();

        ListNode head = ListNode.buildWithCycle(new int[]{3, 2, 0, -4}, 1);
        ListNode r = sol.detectCycle(head);
        ListNode.check("Cycle entry of [3,2,0,-4] pos 1",    r != null ? String.valueOf(r.val) : "null",   "2");

        head = ListNode.buildWithCycle(new int[]{1, 2}, 0);
        r = sol.detectCycle(head);
        ListNode.check("Cycle entry of [1,2] pos 0",         r != null ? String.valueOf(r.val) : "null",   "1");

        head = ListNode.buildWithCycle(new int[]{1}, -1);
        r = sol.detectCycle(head);
        ListNode.check("No cycle in [1]",                    r != null ? String.valueOf(r.val) : "null",   "null");

        head = ListNode.buildWithCycle(new int[]{1, 2, 3, 4, 5}, 2);
        r = sol.detectCycle(head);
        ListNode.check("Cycle entry of [1,2,3,4,5] pos 2",   r != null ? String.valueOf(r.val) : "null",   "3");

        head = ListNode.buildWithCycle(new int[]{1, 2, 3, 4, 5}, -1);
        r = sol.detectCycle(head);
        ListNode.check("No cycle in [1,2,3,4,5]",            r != null ? String.valueOf(r.val) : "null",   "null");
    }
}
