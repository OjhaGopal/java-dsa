public class InsertAtTail {
    public ListNode insertAtTail(ListNode head, int val) {
<<<<<<< Updated upstream
        // TODO
=======
        
>>>>>>> Stashed changes
        ListNode n1 = new ListNode(val);

        ListNode temp = head;

<<<<<<< Updated upstream
        while(temp.next != null){
            temp=temp.next;
        }
      
=======
        while(temp.next!=null){
            temp = temp.next;

        }
        temp.next=n1;
>>>>>>> Stashed changes
        return head;
        
    }
}
