public class InsertAtTail {
    public ListNode insertAtTail(ListNode head, int val) {
        // TODO
        ListNode n1 = new ListNode(val);

        ListNode temp = head;

        while(temp.next != null){
            temp=temp.next;
        }
      
        return head;
    }
}
