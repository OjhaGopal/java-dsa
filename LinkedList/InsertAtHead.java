public class InsertAtHead {
    public ListNode insertAtHead(ListNode head, int val) {
        ListNode n1 = new ListNode(val);
        n1.next = head;
        head = n1;
        return head;
    }
}
