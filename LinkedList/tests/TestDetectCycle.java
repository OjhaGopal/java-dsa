public class TestDetectCycle {
    public static void main(String[] args) {
        DetectCycle sol = new DetectCycle();

        ListNode head = ListNode.buildWithCycle(new int[]{3, 2, 0, -4}, 1);
        ListNode.check("Cycle at index 1 in [3,2,0,-4]",     String.valueOf(sol.hasCycle(head)),            "true");

        head = ListNode.buildWithCycle(new int[]{1, 2}, 0);
        ListNode.check("Cycle at index 0 in [1,2]",          String.valueOf(sol.hasCycle(head)),            "true");

        head = ListNode.buildWithCycle(new int[]{1}, -1);
        ListNode.check("No cycle in [1]",                    String.valueOf(sol.hasCycle(head)),            "false");

        head = ListNode.buildWithCycle(new int[]{1, 2, 3, 4, 5}, -1);
        ListNode.check("No cycle in [1,2,3,4,5]",            String.valueOf(sol.hasCycle(head)),            "false");

        head = ListNode.buildWithCycle(new int[]{1, 2, 3, 4}, 0);
        ListNode.check("Cycle tail->head in [1,2,3,4]",      String.valueOf(sol.hasCycle(head)),            "true");
    }
}
