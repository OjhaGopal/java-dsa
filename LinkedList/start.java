package LinkedList;

public class start {

    public static void main(String[] args){
        LinkedList list = new LinkedList();

        // add nodes — each value goes to the tail of the list
        list.add(1);
        list.add(2);
        list.add(3);
        list.add(4);
        list.add(5);
        // list is now: 1 -> 2 -> 3 -> 4 -> 5 -> null

        // manually traverse the list using a temp pointer
        // temp starts at head and moves forward until null (end of list)
        LinkedList.Node temp = list.head;

        while(temp != null){
            System.out.println(temp.data); // print current node's value
            temp = temp.next;              // move to the next node
        }
    }
}