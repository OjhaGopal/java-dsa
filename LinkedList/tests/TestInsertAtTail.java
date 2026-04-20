public class TestInsertAtTail {
    public static void main(String[] args) {
        InsertAtTail sol = new InsertAtTail();

        ListNode head = ListNode.build(new int[]{1, 2, 3});
        ListNode.check("Insert 4 into [1,2,3]",         ListNode.print(sol.insertAtTail(head, 4)),         "1 -> 2 -> 3 -> 4");

        ListNode.check("Insert 7 into []",              ListNode.print(sol.insertAtTail(null, 7)),         "7");

        head = ListNode.build(new int[]{1});
        ListNode.check("Insert 2 into [1]",             ListNode.print(sol.insertAtTail(head, 2)),         "1 -> 2");

        head = ListNode.build(new int[]{1, 2, 3});
        ListNode.check("Insert 0 into [1,2,3]",         ListNode.print(sol.insertAtTail(head, 0)),         "1 -> 2 -> 3 -> 0");

        head = ListNode.build(new int[]{5, 10});
        ListNode.check("Insert -1 into [5,10]",         ListNode.print(sol.insertAtTail(head, -1)),        "5 -> 10 -> -1");
    }
}
