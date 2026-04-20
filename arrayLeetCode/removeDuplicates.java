package arrayLeetCode;

public class removeDuplicates {

    public int removeDuplicates(int[] nums) {
        // k points to the position for the next unique element
        int k = 1;

        for (int i = 1; i < nums.length; i++) {
            // If current element is different from the last unique element
            if (nums[i] != nums[i - 1]) {
                nums[k] = nums[i];
                k++;
            }
        }

        return k;
    }

    public static void main(String[] args) {
        removeDuplicates sol = new removeDuplicates();

        int[] nums1 = {1, 1, 2};
        int k1 = sol.removeDuplicates(nums1);
        System.out.print("k = " + k1 + ", nums = [");
        for (int i = 0; i < k1; i++) System.out.print(nums1[i] + (i < k1 - 1 ? ", " : ""));
        System.out.println("]"); // Expected: k=2, [1, 2]

        int[] nums2 = {0, 0, 1, 1, 1, 2, 2, 3, 3, 4};
        int k2 = sol.removeDuplicates(nums2);
        System.out.print("k = " + k2 + ", nums = [");
        for (int i = 0; i < k2; i++) System.out.print(nums2[i] + (i < k2 - 1 ? ", " : ""));
        System.out.println("]"); // Expected: k=5, [0, 1, 2, 3, 4]
    }
}

