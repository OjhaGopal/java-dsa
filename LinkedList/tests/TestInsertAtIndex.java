public class TestInsertAtIndex {
    public static void main(String[] args) {
        InsertAtIndex sol = new InsertAtIndex();

        ListNode head = ListNode.build(new int[]{1, 2, 4, 5});
        ListNode.check("Insert 3 at index 2 in [1,2,4,5]",   ListNode.print(sol.insertAtIndex(head, 2, 3)),    "1 -> 2 -> 3 -> 4 -> 5");

        head = ListNode.build(new int[]{2, 3, 4});
        ListNode.check("Insert 1 at index 0 in [2,3,4]",     ListNode.print(sol.insertAtIndex(head, 0, 1)),    "1 -> 2 -> 3 -> 4");

        head = ListNode.build(new int[]{1, 2, 3});
        ListNode.check("Insert 4 at index 3 in [1,2,3]",     ListNode.print(sol.insertAtIndex(head, 3, 4)),    "1 -> 2 -> 3 -> 4");

        head = ListNode.build(new int[]{1});
        ListNode.check("Insert 2 at index 1 in [1]",         ListNode.print(sol.insertAtIndex(head, 1, 2)),    "1 -> 2");

        ListNode.check("Insert 9 at index 0 in []",          ListNode.print(sol.insertAtIndex(null, 0, 9)),    "9");
    }
}
