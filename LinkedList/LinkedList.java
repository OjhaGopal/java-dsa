package LinkedList;

public class LinkedList {

    // Each element in the list is stored as a Node.
    // Node holds the value (data) and a reference to the next node.
    static class Node {
        int data;   // value stored in this node
        Node next;  // pointer to the next node (null if last node)

        Node(int data) {
            this.data = data;
            this.next = null; // new node always starts with no next
        }
    }

    Node head; // points to the first node; null means list is empty

    // Adds a new node at the end (tail) of the list.
    public void add(int data) {
        Node newNode = new Node(data);

        // if list is empty, the new node becomes the head
        if (head == null) {
            head = newNode;
            return;
        }

        // otherwise walk to the last node and attach the new node
        Node temp = head;
        while (temp.next != null) {
            temp = temp.next;
        }
        temp.next = newNode;
    }

    // Prints every node's value from head to tail.
    public void print() {
        Node temp = head;

        // visit each node until we reach null (end of list)
        while (temp != null) {
            System.out.println(temp.data);
            temp = temp.next; // move to next node
        }
    }
}
