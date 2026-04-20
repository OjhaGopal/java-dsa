public class TestInsertAtHead {
    public static void main(String[] args) {
        InsertAtHead sol = new InsertAtHead();

        ListNode head = ListNode.build(new int[]{2, 3, 4});
        ListNode.check("Insert 1 into [2,3,4]",        ListNode.print(sol.insertAtHead(head, 1)),         "1 -> 2 -> 3 -> 4");

        ListNode.check("Insert 5 into []",              ListNode.print(sol.insertAtHead(null, 5)),         "5");

        head = ListNode.build(new int[]{10});
        ListNode.check("Insert 7 into [10]",            ListNode.print(sol.insertAtHead(head, 7)),         "7 -> 10");

        head = ListNode.build(new int[]{1, 2, 3});
        ListNode.check("Insert 0 into [1,2,3]",         ListNode.print(sol.insertAtHead(head, 0)),         "0 -> 1 -> 2 -> 3");

        head = ListNode.build(new int[]{1, 2});
        ListNode.check("Insert -5 into [1,2]",          ListNode.print(sol.insertAtHead(head, -5)),        "-5 -> 1 -> 2");
    }
}
