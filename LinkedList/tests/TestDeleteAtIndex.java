public class TestDeleteAtIndex {
    public static void main(String[] args) {
        DeleteAtIndex sol = new DeleteAtIndex();

        ListNode head = ListNode.build(new int[]{1, 2, 3, 4, 5});
        ListNode.check("Delete index 2 from [1,2,3,4,5]",    ListNode.print(sol.deleteAtIndex(head, 2)),       "1 -> 2 -> 4 -> 5");

        head = ListNode.build(new int[]{1, 2, 3});
        ListNode.check("Delete index 0 from [1,2,3]",        ListNode.print(sol.deleteAtIndex(head, 0)),       "2 -> 3");

        head = ListNode.build(new int[]{1, 2, 3});
        ListNode.check("Delete index 2 (tail) from [1,2,3]", ListNode.print(sol.deleteAtIndex(head, 2)),       "1 -> 2");

        head = ListNode.build(new int[]{9});
        ListNode.check("Delete index 0 from [9]",            ListNode.print(sol.deleteAtIndex(head, 0)),       "[]");

        head = ListNode.build(new int[]{1, 2, 3, 4});
        ListNode.check("Delete index 2 from [1,2,3,4]",      ListNode.print(sol.deleteAtIndex(head, 2)),       "1 -> 2 -> 4");
    }
}
