// LeetCode Problem: Remove Linked List Elements
// Link: https://leetcode.com/problems/remove-linked-list-elements/description/
// Difficulty: Easy
//
// Problem: Given the head of a linked list and an integer val,
// remove all nodes where Node.val == val and return the new head.
//
// Approach: Use a dummy node before head so we never need to
// special-case deleting the head itself. Walk with curr pointer —
// skip matched nodes by rewiring curr.next; otherwise advance curr.
// Time: O(n)  |  Space: O(1)

/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class Solution {
    public ListNode removeElements(ListNode head, int val) {
        // dummy sits before head — handles head deletion without edge cases
        ListNode dummy = new ListNode(0);
        dummy.next = head;

        ListNode curr = dummy;
        while (curr.next != null) {
            if (curr.next.val == val) {
                curr.next = curr.next.next; // skip the matched node
            } else {
                curr = curr.next; // only advance if no deletion
            }
        }

        return dummy.next; // new head (dummy.next may have changed)
    }
}