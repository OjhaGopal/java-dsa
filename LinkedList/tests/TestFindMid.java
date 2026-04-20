public class TestFindMid {
    public static void main(String[] args) {
        FindMid sol = new FindMid();

        ListNode head = ListNode.build(new int[]{1, 2, 3, 4, 5});
        ListNode.check("Mid of [1,2,3,4,5]",            ListNode.print(sol.middleNode(head)),              "3 -> 4 -> 5");

        head = ListNode.build(new int[]{1, 2, 3, 4, 5, 6});
        ListNode.check("Mid of [1,2,3,4,5,6]",          ListNode.print(sol.middleNode(head)),              "4 -> 5 -> 6");

        head = ListNode.build(new int[]{1, 2});
        ListNode.check("Mid of [1,2]",                  ListNode.print(sol.middleNode(head)),              "2");

        head = ListNode.build(new int[]{1});
        ListNode.check("Mid of [1]",                    ListNode.print(sol.middleNode(head)),              "1");

        head = ListNode.build(new int[]{10, 20, 30, 40});
        ListNode.check("Mid of [10,20,30,40]",          ListNode.print(sol.middleNode(head)),              "30 -> 40");
    }
}
