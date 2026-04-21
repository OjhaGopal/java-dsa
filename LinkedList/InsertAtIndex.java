public class InsertAtIndex {
    public ListNode insertAtIndex(ListNode head, int index, int val) {
        // TODO
        ListNode n1 = new ListNode(val);


        if (index == 0){
            n1.next=head;
            return n1;
        }
        ListNode temp = head;

        for(int i = 1; i<= index-1;i++){
            temp = temp.next;

        }

        ListNode temp1=temp.next;
        temp.next=n1;
        n1.next=temp1;
        return head;
    }
}
