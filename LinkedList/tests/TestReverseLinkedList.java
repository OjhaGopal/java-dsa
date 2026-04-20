public class TestReverseLinkedList {
    public static void main(String[] args) {
        ReverseLinkedList sol = new ReverseLinkedList();

        ListNode head = ListNode.build(new int[]{1, 2, 3, 4, 5});
        ListNode.check("Reverse [1,2,3,4,5]",           ListNode.print(sol.reverseList(head)),             "5 -> 4 -> 3 -> 2 -> 1");

        head = ListNode.build(new int[]{1, 2});
        ListNode.check("Reverse [1,2]",                 ListNode.print(sol.reverseList(head)),             "2 -> 1");

        head = ListNode.build(new int[]{1});
        ListNode.check("Reverse [1]",                   ListNode.print(sol.reverseList(head)),             "1");

        ListNode.check("Reverse []",                    ListNode.print(sol.reverseList(null)),             "[]");

        head = ListNode.build(new int[]{5, 4, 3, 2, 1});
        ListNode.check("Reverse [5,4,3,2,1]",           ListNode.print(sol.reverseList(head)),             "1 -> 2 -> 3 -> 4 -> 5");
    }
}
