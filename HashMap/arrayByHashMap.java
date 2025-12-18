
// Frequency of each query element in the array.

// Create a HashMap to store the frequency of each element in the array.

// Iterate through the array and update the frequency of each element in the HashMap.

// Iterate through the array and update the frequency of each element in the HashMap.

import java.util.HashMap;
import java.util.Scanner;

public class arrayByHashMap {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int m = sc.nextInt();

            int arr[] = new int[n];
            for (int i = 0; i < n; i++) {
                arr[i] = sc.nextInt();
            }

            int queries[] = new int[m];
            for (int i = 0; i < m; i++) {
                queries[i] = sc.nextInt();
            }

            printfrequency(arr, queries, n, m);
        }

    }

    public static void printfrequency(int arr[], int queries[], int n, int m) {

        HashMap<Integer, Integer> hm = new HashMap<>();

        for (int i = 0; i < n; i++) {
            if (hm.containsKey(arr[i]) == false) {
                hm.put(arr[i], 1);
            } else {
                int temp = hm.get(arr[i]);
                hm.put(arr[i], temp + 1);
            }
        }
        for (int i = 0; i < m; i++) {
            if (hm.containsKey(queries[i]) == false) {
                System.out.println("0");

            } else {
                System.out.println(hm.get(queries[i]));
            }
        }
    }
}

/*
 * Explanation of the Code:
 *
 * 1. Purpose:
 * The goal is to find the frequency of specific query elements within a given
 * array.
 * Using a nested loop would take O(N * M) time, which might be too slow for
 * large inputs.
 * Using a HashMap allows us to solve this in O(N + M) time on average.
 *
 * 2. Logic:
 * - We use a HashMap<Integer, Integer> to store the frequency map.
 * Key = The element from the array.
 * Value = The count (frequency) of that element.
 *
 * - First Loop (Pre-computation):
 * We iterate through the input array 'arr'. For each element:
 * - If it is NOT in the map, we add it with a frequency of 1.
 * - If it IS already in the map, we get its current count, increment it by 1,
 * and update the map.
 *
 * - Second Loop (Answering Queries):
 * We iterate through the 'queries' array. For each query number:
 * - We check if it exists in our HashMap.
 * - If it exists, we print its stored frequency.
 * - If it does not exist (containsKey returns false), it means the number was
 * not in the original array, so we print 0.
 *
 * 3. Time Complexity:
 * - Inserting N elements into HashMap: O(N) average.
 * - Looking up M queries in HashMap: O(M) average.
 * - Total: O(N + M).
 */
