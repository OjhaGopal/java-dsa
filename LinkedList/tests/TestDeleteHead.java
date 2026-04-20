public class TestDeleteHead {
    public static void main(String[] args) {
        DeleteHead sol = new DeleteHead();

        ListNode head = ListNode.build(new int[]{1, 2, 3, 4});
        ListNode.check("Delete head of [1,2,3,4]",      ListNode.print(sol.deleteHead(head)),              "2 -> 3 -> 4");

        head = ListNode.build(new int[]{5});
        ListNode.check("Delete head of [5]",            ListNode.print(sol.deleteHead(head)),              "[]");

        head = ListNode.build(new int[]{1, 2});
        ListNode.check("Delete head of [1,2]",          ListNode.print(sol.deleteHead(head)),              "2");

        ListNode.check("Delete head of []",             ListNode.print(sol.deleteHead(null)),              "[]");

        head = ListNode.build(new int[]{1, 2, 3});
        head = sol.deleteHead(head);
        ListNode.check("Delete head twice from [1,2,3]",ListNode.print(sol.deleteHead(head)),              "3");
    }
}
