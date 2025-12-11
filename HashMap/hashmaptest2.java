import java.util.HashMap;

public class hashmaptest2 {
    public static void main(String[] args) {
        HashMap<Integer, Integer> hm = new HashMap<>();

        hm.put(10, 20);
        hm.put(30, 40);
        hm.put(10, 50);
        hm.put(80, 90);
        hm.put(20, 60); 
        hm.put(70, 80); 
        hm.put(90, 100);

        // Put is use to insert or update key-value pairs in the HashMap
        // get is used to retrieve the value associated with a specific key

        hm.put(40, 70);
        System.out.println(hm.get(40));
        System.out.println(hm.get(80));

        System.out.println(hm.containsKey(10));

        // Containskey is used to check if a specific key exists in the HashMap
        // containsvalue is used to check if a specific value exists in the HashMap
        System.out.println(hm.containsValue(90));

        // Size method is used to get the number of key-value pairs in the HashMap
        System.out.println(hm.size());

        // Remove method is used to remove a key-value pair from the HashMap based on the key
        hm.remove(30);
        System.out.println(hm.size());

        // Itrating over the HashMap using for-each loop
        // In HashMap we itrating on keys.

        for (int e : hm.keySet()) {
            System.out.println(e + " " + hm.get(e));
        }

        // Time complexity of the loop is O(n) where n is the number of key-value pairs in the HashMap

        // HashMap is a tool used to solve problems related to key-value pairs.

// Idea 1
        // Iterate and count for every query how many times it occurs in the array.
        // Time complexity: O(n^2)  
        // 

// Idea 2
        // Use HashMap to store the frequency of each element in the array.
        // For each query, directly retrieve the frequency from the HashMap.
        // create HashMap of given array and store frequency of each element.
        int[] arr = { 1, 2, 3, 1, 2, 1, 4, 5, 3, 2, 1 };    

        HashMap<Integer, Integer> hm2 = new HashMap<>();

        for (int num : arr) {
            hm2.put(num, hm2.getOrDefault(num, 0) + 1);
        }

    }
}

// In HashMap, the orders of key-value pairs are not guaranteed to be maintained.

// The order is predictable based on the hash codes of the keys and the internal structure of the HashMap.

// Time complexity: O(1) for both put and get operations on average
// Space complexity: O(n) where n is the number of key-value pairs in the HashMap

// Values are not related but keys are related and unique. So when we inser a
// new value with an existing key, it updates the value for that key.
// First time its added and second time when we updaetd the value for key 10, it
// updated the value from 20 to 50. Hence the final map contains key 10 with value
// 50. The output of the program is 70, which is the value
